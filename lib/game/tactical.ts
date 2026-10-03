import {MOVES,SPECIES} from './content.ts';
import {chooseStrategic} from './bots.ts';
import {active,alive,legal,key,required,resolveTurn,commit} from './engine.ts';
import {effective} from './math.ts';
import type {Game,Choice,Player} from './types.ts';
export const TACTICAL_VERSION='tactical-four-turn-v1';
function value(g:Game,p:Player){if(g.outcome)return g.outcome.winner===null?0:g.outcome.winner===p?10000:-10000;const score=(side:Player)=>alive(g,side).length*1000+g.sides[side].team.reduce((sum,m)=>sum+Math.floor(100*m.hp/SPECIES[m.monster_id].stats.health),0);return score(p)-score(p===0?1:0);}
async function replace(g:Game){for(const p of [0,1] as Player[])if(g.gate==='replace'&&required(g,p)&&!g.pending[p])g=await commit(g,p,g.gateId,chooseStrategic(g,p));return g;}
export async function chooseTactical(input:Game,p:Player):Promise<Choice>{
 if(input.gate!=='normal')return chooseStrategic(input,p);
 const g=structuredClone(input);g.pending=[null,null];g.events=[];g.commitments=[];g.trace=[];g.counters={};g.seed='0'.repeat(64);
 const op:Player=p===0?1:0,own=legal(g,p),opponent=legal(g,op);let resolutions=0;
 async function forecast(start:Game,choices:[Choice,Choice],remaining:number):Promise<number>{
  const a=choices[0],b=choices[1],tie=a.kind==='move'&&b.kind==='move'&&MOVES[a.move].priority===MOVES[b.move].priority&&effective(active(start,0),'speed')===effective(active(start,1),'speed');
  const orders:Player[]=tie?[0,1]:[0];let sum=0;
  for(const first of orders){if(++resolutions>1470)throw Error('Tactical forecast exceeded its approved bound');let next=structuredClone(start);await resolveTurn(next,choices,{critical:false,tieWinner:first});if(next.outcome||remaining===1){sum+=value(next,p);continue;}next=await replace(next);const pair=[chooseStrategic(next,0),chooseStrategic(next,1)] as [Choice,Choice];sum+=await forecast(next,pair,remaining-1);}
  return sum/orders.length;
 }
 let chosen=own[0],best=-Infinity;
 for(const a of own){let sum=0,min=Infinity;for(const b of opponent){const pair=(p===0?[a,b]:[b,a]) as [Choice,Choice],u=await forecast(g,pair,4);const exact=u*16;if(!Number.isInteger(exact))throw Error('Forecast should be an exact dyadic value');sum+=exact;min=Math.min(min,exact);}const numerator=sum+opponent.length*min;if(numerator>best||numerator===best&&key(a)<key(chosen)){chosen=a;best=numerator;}}
 return chosen;
}
