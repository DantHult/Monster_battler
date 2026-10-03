import {CONTENT,SPECIES,SETS,MOVES,STATUS} from './content.ts';
import {Rng} from './rng.ts';
import {offer,instantiate} from './generator.ts';
import {damage,effective,fractionHealth} from './math.ts';
import type {Game,Player,Choice,GameEvent,Outcome,Battler,Timed,Gate,View} from './types.ts';
export const other=(p:Player):Player=>p===0?1:0;
export function alive(g:Game,p:Player){return g.sides[p].team.map((m,i)=>m.hp>0?i:-1).filter(i=>i>=0);}
export function active(g:Game,p:Player){return g.sides[p].team[g.sides[p].active];}
export function key(c:Choice){switch(c.kind){case'move':return 'move:'+c.move;case'lead':case'switch':return c.kind+':'+c.slot;default:return c.kind;}}
export function required(g:Game,p:Player){return g.gate!=='finished'&&(g.gate!=='replace'||!active(g,p)||active(g,p).hp===0);}
export function legal(g:Game,p:Player):Choice[]{
 if(!required(g,p))return [];
 if(g.gate==='offer')return [{kind:'keep'},{kind:'redraw'}];
 if(g.gate==='lead'||g.gate==='replace')return alive(g,p).map(slot=>({kind:g.gate==='lead'?'lead':'switch',slot} as Choice));
 const m=active(g,p);if(!m||m.hp<=0)return [];
 const moves=SETS[m.set_id].move_ids.filter(id=>m.uses[id]>0).map(move=>({kind:'move',move} as Choice));
 if(SETS[m.set_id].move_ids.filter(id=>MOVES[id].power>0).every(id=>m.uses[id]===0))moves.push({kind:'move',move:m.fallback});
 return [...moves,...alive(g,p).filter(i=>i!==g.sides[p].active).map(slot=>({kind:'switch',slot} as Choice))].sort((a,b)=>key(a)<key(b)?-1:1);
}
function emit(g:Game,e:Omit<GameEvent,'turn'>){g.events.push({turn:g.turn,...e});}
function finish(g:Game,outcome:Outcome){g.outcome=outcome;g.gate='finished';g.pending=[null,null];emit(g,{kind:'result',text:outcome.winner===null?`Contest drawn (${outcome.reason.replaceAll('_',' ')}).`:`Player ${outcome.winner+1} wins (${outcome.reason}).`});}
function checkWin(g:Game){const a=alive(g,0).length,b=alive(g,1).length;if(!a&&!b)finish(g,{winner:null,reason:'simultaneous_knockout'});else if(!a||!b)finish(g,{winner:a?0:1,reason:'knockout'});return !!g.outcome;}
function knockout(g:Game,p:Player,slot:number){const m=g.sides[p].team[slot];m.hp=0;m.modifiers={};m.reduction=null;emit(g,{kind:'knockout',player:p,slot,text:`${SPECIES[m.monster_id].name} is knocked out.`});}
function switchIn(g:Game,p:Player,slot:number,kind='switch'){const outgoing=active(g,p);if(outgoing){outgoing.modifiers={};outgoing.reduction=null;}g.sides[p].active=slot;emit(g,{kind,player:p,slot,text:`Player ${p+1} sends in ${SPECIES[active(g,p).monster_id].name}.`});}
function enter(g:Game,gate:Gate){g.gate=gate;g.gateId++;g.pending=[null,null];}
export async function createGame(seed:string):Promise<Game>{
 const g:Game={format_version:'lantern-replay-v1',content_version:CONTENT.version,rules_version:CONTENT.rules_version,profile:CONTENT.profile,rng_version:'hmac-sha256-counter-u32-v1',seed,counters:{},trace:[],sides:[] as unknown as Game['sides'],gate:'offer',gateId:1,turn:0,pending:[null,null],commitments:[],events:[],outcome:null};
 const rng=new Rng(seed,g.counters,g.trace),p0=await offer(rng,0,0),p1=await offer(rng,1,0);
 g.sides=[p0,p1].map(ids=>({team:ids.map(instantiate),active:-1,offer0:ids,offer1:null,redrawn:false})) as Game['sides'];return g;
}
type ResolutionOptions={critical?:boolean;tieWinner?:Player};
export async function resolveTurn(g:Game,choices:[Choice,Choice],options:ResolutionOptions={}){
 g.turn++;const rng=new Rng(g.seed,g.counters,g.trace);
 for(const p of [0,1] as Player[])if(choices[p].kind==='switch')switchIn(g,p,(choices[p] as {slot:number}).slot);
 const queue=([0,1] as Player[]).filter(p=>choices[p].kind==='move').map(p=>({p,slot:g.sides[p].active,move:MOVES[(choices[p] as {move:string}).move],speed:effective(active(g,p),'speed')}));
 if(queue.length===2){const [a,b]=queue;if(a.move.priority===b.move.priority&&a.speed===b.speed){const first=options.tieWinner??await rng.int('battle:tie',2);emit(g,{kind:'tie',text:`Exact Speed tie: Player ${first+1} acts first.`,player:first as Player});if(first===1)queue.reverse();}else queue.sort((a,b)=>b.move.priority-a.move.priority||b.speed-a.speed);}
 for(const a of queue){
  const actor=g.sides[a.p].team[a.slot];if(actor.hp<=0||g.sides[a.p].active!==a.slot){emit(g,{kind:'canceled',player:a.p,slot:a.slot,move:a.move.id,text:`${a.move.name} is canceled; its user was knocked out.`});continue;}
  if(a.move.max_uses!==null)actor.uses[a.move.id]--;
  emit(g,{kind:'move',player:a.p,slot:a.slot,move:a.move.id,text:`${SPECIES[actor.monster_id].name} uses ${a.move.name}.`});
  for(const effect of a.move.effects){
   const p=effect.target==='self'?a.p:other(a.p),slot=g.sides[p].active,target=active(g,p);if(!target||target.hp<=0)continue;
   const source={player:a.p,slot:a.slot},timed:Timed={source,remaining:effect.duration??0,numerator:effect.numerator,denominator:effect.denominator};
   switch(effect.op){
    case'deal_direct_damage':{const critical=options.critical??((await rng.int('battle:critical',36))===0),computed=damage(actor,target,a.move,critical),actual=Math.min(target.hp,computed);target.hp-=actual;emit(g,{kind:'damage',player:a.p,slot:a.slot,target_player:p,target_slot:slot,move:a.move.id,damage:computed,actual,critical,source,text:`${SPECIES[target.monster_id].name} loses ${actual} Health${critical?' · critical hit':''}.`});if(!target.hp)knockout(g,p,slot);break;}
    case'restore_health_fraction':{const actual=Math.min(SPECIES[target.monster_id].stats.health-target.hp,fractionHealth(target,effect.numerator!,effect.denominator!));target.hp+=actual;emit(g,{kind:'heal',player:p,slot,actual,source,text:`${SPECIES[target.monster_id].name} restores ${actual} Health.`});break;}
    case'apply_status':target.statuses[effect.status!]={source,remaining:STATUS[effect.status!].duration};emit(g,{kind:'status',player:p,slot,source,text:`${SPECIES[target.monster_id].name} gains ${STATUS[effect.status!].name}.`});break;
    case'apply_stat_modifier':target.modifiers[effect.stat!]=timed;emit(g,{kind:'modifier',player:p,slot,source,text:`${SPECIES[target.monster_id].name}: ${effect.stat} ×${effect.numerator! / effect.denominator!}.`});break;
    case'apply_damage_reduction':target.reduction=timed;emit(g,{kind:'reduction',player:p,slot,source,text:`${SPECIES[target.monster_id].name} braces against direct damage.`});break;
    case'remove_statuses':for(const id of effect.statuses!)delete target.statuses[id];emit(g,{kind:'cleanse',player:p,slot,source,text:`${SPECIES[target.monster_id].name} clears Fray and Tethered.`});break;
    case'clear_stat_modifiers':target.modifiers={};emit(g,{kind:'clear_boost',player:p,slot,source,text:`${SPECIES[target.monster_id].name}'s stat boosts are cleared.`});break;
    default:throw Error('Unknown effect operation '+effect.op);
   }
  }
  if(checkWin(g))return;
 }
 // Collect periodic losses first, so two final knockouts truly happen together.
 const captured=([0,1] as Player[]).filter(p=>active(g,p)?.hp>0).map(p=>({p,slot:g.sides[p].active,mon:active(g,p)}));
 const losses=captured.flatMap(({p,slot,mon})=>Object.entries(mon.statuses).flatMap(([id,t])=>STATUS[id].end_effects.map(e=>({p,slot,mon,source:t.source,actual:Math.min(mon.hp,Math.max(1,fractionHealth(mon,e.numerator!,e.denominator!))),id}))));
 for(const x of losses){x.mon.hp-=x.actual;emit(g,{kind:'periodic',player:x.p,slot:x.slot,actual:x.actual,source:x.source,text:`${SPECIES[x.mon.monster_id].name} loses ${x.actual} Health to ${STATUS[x.id].name}.`});}
 for(const {p,slot,mon}of captured){if(!mon.hp)knockout(g,p,slot);for(const [id,t]of Object.entries(mon.statuses)){if(--t.remaining===0)delete mon.statuses[id];}for(const [id,t]of Object.entries(mon.modifiers)){if(--t!.remaining===0)delete mon.modifiers[id as keyof Battler['modifiers']];}if(mon.reduction&&--mon.reduction.remaining===0)mon.reduction=null;}
 if(checkWin(g))return;
 if(g.turn>=60){finish(g,{winner:null,reason:'turn_cap'});return;}
 if(([0,1] as Player[]).some(p=>active(g,p).hp===0)){
  enter(g,'replace');for(const p of [0,1] as Player[])if(required(g,p)&&alive(g,p).length===1)g.pending[p]={kind:'switch',slot:alive(g,p)[0]};
  if(([0,1] as Player[]).every(p=>!required(g,p)||g.pending[p]))closeReplacement(g);
 }else enter(g,'normal');
}
function closeReplacement(g:Game){for(const p of [0,1] as Player[])if(g.pending[p]?.kind==='switch')switchIn(g,p,(g.pending[p] as {slot:number}).slot,'replacement');enter(g,'normal');}
export async function commit(input:Game,player:Player,gateId:number,choice:Choice):Promise<Game>{
 const previous=input.commitments.find(c=>c.gate===gateId&&c.player===player);
 if(previous){if(key(previous.choice)!==key(choice))throw Error('This choice is already committed.');return input;}
 if(input.gateId!==gateId||input.gate==='finished')throw Error('This decision has closed. Refresh the contest.');
 if(!required(input,player)||input.pending[player])throw Error('No choice is needed from you.');
 if(choice.kind!=='resign'&&!legal(input,player).some(c=>key(c)===key(choice)))throw Error('That choice is not legal.');
 const g=structuredClone(input);g.commitments.push({gate:gateId,phase:g.gate,player,choice});
 if(choice.kind==='resign'){finish(g,{winner:other(player),reason:'resign'});return g;}
 g.pending[player]=choice;
 if(g.gate==='offer'&&choice.kind==='redraw'){
  const s=g.sides[player],ids=await offer(new Rng(g.seed,g.counters,g.trace),player,1,s.offer0);s.redrawn=true;s.offer1=ids;s.team=ids.map(instantiate);
 }
 if(!([0,1] as Player[]).every(p=>!required(g,p)||g.pending[p]))return g;
 switch(g.gate){
  case'offer':emit(g,{kind:'teams',text:'Both teams are revealed. Choose a lead in secret.'});enter(g,'lead');break;
  case'lead':for(const p of [0,1] as Player[])switchIn(g,p,(g.pending[p] as {slot:number}).slot,'lead');enter(g,'normal');break;
  case'normal':await resolveTurn(g,g.pending as [Choice,Choice]);break;
  case'replace':closeReplacement(g);break;
 }
 assertGame(g);return g;
}
export function assertGame(g:Game){
 if(g.turn<0||g.turn>60)throw Error('Invalid turn');
 for(const s of g.sides){if(s.team.length!==4||new Set(s.team.map(x=>x.monster_id)).size!==4)throw Error('Invalid team');for(const m of s.team){if(!Number.isInteger(m.hp)||m.hp<0||m.hp>SPECIES[m.monster_id].stats.health)throw Error('Invalid Health');for(const [id,n]of Object.entries(m.uses))if(!Number.isInteger(n)||n<0||n>MOVES[id].max_uses!)throw Error('Invalid uses');for(const t of [...Object.values(m.statuses),...Object.values(m.modifiers),...(m.reduction?[m.reduction]:[])])if(!t||t.remaining<=0)throw Error('Invalid timed effect');}}
 if(g.gate==='normal'&&g.sides.some(s=>s.active<0||s.team[s.active].hp<=0))throw Error('Normal gate needs living actors');
 if((g.gate==='finished')!==!!g.outcome)throw Error('Invalid outcome gate');
}
export function project(g:Game,player:Player){
 const {seed:_,counters:__,trace:___,commitments:____,pending:_____,sides,...visible}=g;void _;void __;void ___;void ____;void _____;
 const shown=sides.map((s,p)=>{
  if(g.gate==='offer'&&p!==player)return null;
  return {...s,offer0:p===player||g.gate==='finished'?s.offer0:[],offer1:p===player||g.gate==='finished'?s.offer1:null};
 }) as [typeof sides[0]|null,typeof sides[1]|null];
 return {...visible,sides:shown,committed:!!g.pending[player],required:required(g,player),legal:g.pending[player]?[]:legal(g,player)} as View['game'];
}
export async function replay(g:Game){let restored=await createGame(g.seed);for(const c of g.commitments)restored=await commit(restored,c.player,c.gate,c.choice);if(JSON.stringify(restored)!==JSON.stringify(g))throw Error('Replay mismatch');return restored;}
