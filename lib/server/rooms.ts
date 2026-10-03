import {createGame,commit,project} from '../game/engine.ts';
import {CONTENT} from '../game/content.ts';
import {randomSeed,sha256} from '../game/rng.ts';
import type {Game,Player,Choice,View} from '../game/types.ts';
// Small D1 interface also supports an actual SQLite adapter in integration tests.
export type Statement={bind(...args:unknown[]):Statement;first<T>():Promise<T|null>;all<T>():Promise<{results:T[]}>;run():Promise<{meta?:{changes?:number}}>};
export type Database={prepare(sql:string):Statement};
export type Row={id:string;state:string;version:number;p0_token_hash:string;p1_token_hash:string|null;created_at:number;p0_seen:number;p1_seen:number;journal:string};
export class RoomError extends Error {status:number;constructor(message:string,status=400){super(message);this.status=status;}}
const roomPattern=/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{8}$/;
function roomCode(){const letters='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';return [...crypto.getRandomValues(new Uint8Array(8))].map(x=>letters[x%32]).join('');}
export async function row(db:Database,id:string){if(!roomPattern.test(id))throw new RoomError('Enter an 8-character room code.');const r=await db.prepare('SELECT * FROM matches WHERE id = ?').bind(id).first<Row>();if(!r)throw new RoomError('Room not found. Check the code with your friend.',404);return r;}
async function seat(r:Row,token:string){if(!/^[0-9a-f]{64}$/.test(token))throw new RoomError('Rejoin this room from your original browser window.',401);const hash=await sha256(token);if(hash===r.p0_token_hash)return 0;if(hash===r.p1_token_hash)return 1;throw new RoomError('This seat belongs to another browser window.',403);}
function view(r:Row,p:Player):View{return {room:r.id,player:p,joined:!!r.p1_token_hash,opponentOnline:Date.now()-(p===0?r.p1_seen:r.p0_seen)<20000,version:r.version,game:project(JSON.parse(r.state),p)};}
export async function createRoom(db:Database){
 const token=randomSeed(),hash=await sha256(token),g=await createGame(randomSeed()),now=Date.now();
 for(let attempt=0;attempt<4;attempt++){const id=roomCode();try{await db.prepare('INSERT INTO matches (id, state, version, p0_token_hash, p1_token_hash, created_at, p0_seen, p1_seen, journal) VALUES (?, ?, 0, ?, NULL, ?, ?, 0, ?)').bind(id,JSON.stringify(g),hash,now,now,JSON.stringify([{kind:'created',at:now}])).run();return {token,view:view(await row(db,id),0)};}catch(e){if(!String(e).includes('UNIQUE'))throw e;}}
 throw new RoomError('Could not open a room. Please try again.',503);
}
export async function joinRoom(db:Database,id:string){const token=randomSeed(),hash=await sha256(token);
 for(let attempt=0;attempt<6;attempt++){
  const r=await row(db,id);if(r.p1_token_hash)throw new RoomError('This room already has two players.',409);if(JSON.parse(r.state).outcome)throw new RoomError('This contest has ended.',409);
  const now=Date.now(),journal=JSON.parse(r.journal);journal.push({kind:'joined',at:now});
  const result=await db.prepare('UPDATE matches SET p1_token_hash = ?, p1_seen = ?, version = version + 1, journal = ? WHERE id = ? AND version = ? AND p1_token_hash IS NULL').bind(hash,now,JSON.stringify(journal),id,r.version).run();
  if(result.meta?.changes===1)return {token,view:view(await row(db,id),1)};
 }
 throw new RoomError('Room changed while joining. Please try again.',409);
}
export async function getRoom(db:Database,id:string,token:string){const r=await row(db,id),p=await seat(r,token),now=Date.now();await db.prepare(p===0?'UPDATE matches SET p0_seen = ? WHERE id = ?':'UPDATE matches SET p1_seen = ? WHERE id = ?').bind(now,id).run();if(p===0)r.p0_seen=now;else r.p1_seen=now;return view(r,p);}
export async function submit(db:Database,id:string,token:string,gate:number,choice:Choice){
 for(let attempt=0;attempt<8;attempt++){
  const r=await row(db,id),p=await seat(r,token);if(!r.p1_token_hash)throw new RoomError('Invite an opponent before committing a choice.');
  const original=JSON.parse(r.state) as Game;let next:Game;try{next=await commit(original,p,gate,choice);}catch(e){throw new RoomError(e instanceof Error?e.message:'Invalid choice.',409);}
  if(next===original)return view(r,p);
  const now=Date.now(),journal=JSON.parse(r.journal);journal.push({kind:'choice',at:now,player:p,gate,phase:original.gate,choice});
  const result=await db.prepare('UPDATE matches SET state = ?, journal = ?, version = version + 1 WHERE id = ? AND version = ?').bind(JSON.stringify(next),JSON.stringify(journal),id,r.version).run();
  if(result.meta?.changes===1)return view(await row(db,id),p);
 }
 throw new RoomError('A simultaneous update is still settling. Retry the same choice.',409);
}
export function parseChoice(input:unknown):Choice{
 if(!input||typeof input!=='object'||Array.isArray(input))throw new RoomError('A choice is required.');const c=input as Record<string,unknown>;
 if(c.kind==='keep'||c.kind==='redraw'||c.kind==='resign'){if(Object.keys(c).length!==1)throw new RoomError('Invalid choice fields.');return {kind:c.kind};}
 if(c.kind==='lead'||c.kind==='switch'){if(Object.keys(c).length!==2||!Number.isInteger(c.slot)||(c.slot as number)<0||(c.slot as number)>3)throw new RoomError('Choose a living companion.');return {kind:c.kind,slot:c.slot as number};}
 if(c.kind==='move'){if(Object.keys(c).length!==2||typeof c.move!=='string'||!/^([MF])\d{2}$/.test(c.move))throw new RoomError('Choose a move.');return {kind:'move',move:c.move};}
 throw new RoomError('Unknown choice.');
}
export async function exportRoom(db:Database,id:string,token:string){const r=await row(db,id);await seat(r,token);const game=JSON.parse(r.state);if(!game.outcome)throw new RoomError('Battle records are available when the contest ends.',409);const feedback=await db.prepare('SELECT player, stage, answers, created_at FROM feedback WHERE room_id = ? ORDER BY created_at').bind(id).all<{player:number;stage:string;answers:string;created_at:number}>();return {room:id,game,content:CONTENT,created_at:r.created_at,timeline:JSON.parse(r.journal),feedback:feedback.results.map(f=>({...f,answers:JSON.parse(f.answers)})),source:'lantern-marches-v1'};}
export async function saveFeedback(db:Database,id:string,token:string,input:unknown){const r=await row(db,id),p=await seat(r,token);if(!input||typeof input!=='object')throw new RoomError('Feedback is required.');const {stage,answers}=input as {stage:string;answers:Record<string,unknown>};if(!['first_offer','final_team','post_match'].includes(stage)||!answers||typeof answers!=='object')throw new RoomError('Invalid feedback.');if(stage==='post_match'&&!JSON.parse(r.state).outcome)throw new RoomError('Finish the contest before sending this survey.');if(JSON.stringify(answers).length>2500)throw new RoomError('Feedback is too long.');
 await db.prepare('INSERT INTO feedback (room_id, player, stage, answers, created_at) VALUES (?, ?, ?, ?, ?) ON CONFLICT (room_id, player, stage) DO UPDATE SET answers = excluded.answers, created_at = excluded.created_at').bind(id,p,stage,JSON.stringify(answers),Date.now()).run();return {saved:true};}
