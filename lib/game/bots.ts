import {MOVES,SETS,SPECIES} from './content.ts';
import {alive,active,other,legal,key,required} from './engine.ts';
import {damage} from './math.ts';
import type {Game,Player,Choice,Battler} from './types.ts';
import type {Rng} from './rng.ts';
export type Policy='R'|'S'|'T';
function attacks(m:Battler){const ids=SETS[m.set_id].move_ids.filter(id=>MOVES[id].power>0&&m.uses[id]>0);return ids.length?ids:[m.fallback];}
function best(m:Battler,t:Battler){return Math.max(...attacks(m).map(id=>damage(m,t,id)));}
export function chooseStrategic(g:Game,p:Player):Choice{
 const options=legal(g,p);if(!options.length)throw Error('Bot has no legal choice');
 if(g.gate==='offer')return {kind:'keep'};
 if(g.gate==='lead'||g.gate==='replace'){
  const op=other(p),targets=g.gate==='replace'&&active(g,op)?.hp>0?[active(g,op)]:alive(g,op).map(i=>g.sides[op].team[i]);
  const scored=options.map(c=>{const m=g.sides[p].team[(c as {slot:number}).slot];return {choice:c,score:targets.reduce((sum,t)=>sum+Math.floor(100*best(m,t)/SPECIES[t.monster_id].stats.health)-Math.floor(100*best(t,m)/SPECIES[m.monster_id].stats.health),0)+targets.length*Math.floor(10*m.hp/SPECIES[m.monster_id].stats.health)};});
  scored.sort((a,b)=>b.score-a.score||(a.choice as {slot:number}).slot-(b.choice as {slot:number}).slot);return scored[0].choice;
 }
 const m=active(g,p),target=active(g,other(p));
 const moves=options.filter(c=>c.kind==='move'&&MOVES[c.move].power>0) as {kind:'move';move:string}[];
 moves.sort((a,b)=>Math.min(target.hp,damage(m,target,b.move))-Math.min(target.hp,damage(m,target,a.move))||MOVES[b.move].priority-MOVES[a.move].priority||(m.uses[b.move]??Infinity)-(m.uses[a.move]??Infinity)||(key(a)<key(b)?-1:1));return moves[0];
}
export async function choose(g:Game,p:Player,policy:Policy,rng:Rng):Promise<Choice>{if(!required(g,p))throw Error('Bot not required');if(policy==='S')return chooseStrategic(g,p);if(policy==='T')return (await import('./tactical.ts')).chooseTactical(g,p);if(g.gate==='offer')return {kind:'keep'};const choices=legal(g,p).sort((a,b)=>key(a)<key(b)?-1:1);return choices[await rng.int('bot:p'+p,choices.length)];}
