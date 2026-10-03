import {SPECIES,SETS,MOVES,validateContent} from './content.ts';
import {Rng} from './rng.ts';
import type {Battler,Player} from './types.ts';
export function eligible(ids:string[]){
 if(ids.length!==4)return false;const sets=ids.map(id=>SETS[id]);if(sets.some(x=>!x))return false;
 const monsters=sets.map(s=>SPECIES[s.monster_id]);if(new Set(monsters.map(m=>m.id)).size!==4||new Set(monsters.map(m=>m.type)).size<3)return false;
 const uses=(id:string)=>sets.filter(s=>s.move_ids.includes(id)).length;
 if(uses('M24')<1||uses('M19')>1||uses('M23')>1)return false;
 const credible=(cat:'force'|'spirit')=>sets.some((s,i)=>s.move_ids.some(id=>MOVES[id].roles.includes('core_damage')&&MOVES[id].category===cat&&5*monsters[i].stats[cat]>=4*Math.max(monsters[i].stats.force,monsters[i].stats.spirit)));
 return credible('force')&&credible('spirit')&&monsters.some((m,i)=>m.stats.speed>=85||sets[i].move_ids.includes('M21')||sets[i].move_ids.includes('M22'));
}
let catalog:string[][]|null=null;
export function catalogue(){
 if(catalog)return catalog;validateContent();const species=Object.keys(SPECIES).sort(),result:string[][]=[];let candidates=0;
 for(let a=0;a<9;a++)for(let b=a+1;b<10;b++)for(let c=b+1;c<11;c++)for(let d=c+1;d<12;d++)for(let mask=0;mask<16;mask++){
  if(++candidates>100000)throw Error('Generator enumeration limit');const ids=[a,b,c,d].map((x,i)=>species[x]+((mask>>i)&1?'-B':'-A'));
  if(eligible(ids))result.push(ids);
 }
 result.sort((a,b)=>a.join('+')<b.join('+')?-1:1);if(result.length<2)throw Error('Empty generator profile');
 for(const id of Object.keys(SETS))if(!result.some(t=>t.includes(id)))throw Error('Unreachable set '+id);
 catalog=result;return result;
}
export function redrawPool(previous:string[]){const old=new Set(previous.map(x=>x.slice(0,3)));return catalogue().filter(t=>t.filter(x=>old.has(x.slice(0,3))).length<=2);}
export async function offer(rng:Rng,player:Player,n:0|1,previous?:string[]){
 const pool=previous?redrawPool(previous):catalogue();if(!pool.length)throw Error('No valid redraw');const chosen=[...pool[await rng.int(`team:p${player}:offer${n}`,pool.length)]];
 for(let i=chosen.length-1;i>0;i--){const j=await rng.int(`order:p${player}:offer${n}`,i+1);[chosen[i],chosen[j]]=[chosen[j],chosen[i]];}
 return chosen;
}
export function instantiate(id:string):Battler{const set=SETS[id],m=SPECIES[set.monster_id];return {monster_id:m.id,set_id:id,hp:m.stats.health,uses:Object.fromEntries(set.move_ids.map(id=>[id,MOVES[id].max_uses!])),fallback:m.stats.force>=m.stats.spirit?'F01':'F02',statuses:{},modifiers:{},reduction:null};}
