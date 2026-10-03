import {writeFile,mkdir} from 'node:fs/promises';
import {createGame,commit,project,replay,alive} from '../lib/game/engine.ts';
import {choose} from '../lib/game/bots.ts';
import {Rng,sha256} from '../lib/game/rng.ts';
import {SPECIES} from '../lib/game/content.ts';
const arg=(name,fallback)=>{const i=process.argv.indexOf('--'+name);return i<0?fallback:process.argv[i+1];};
const count=Number(arg('matches','1000')),policies=[arg('p0','S'),arg('p1','S')],campaign=arg('seed','lantern-campaign-v1'),out=arg('out','reports/campaign.json');
if(!Number.isInteger(count)||count<1||count>100000||policies.some(p=>!['R','S','T'].includes(p)))throw Error('Use --matches 1..100000 and --p0/--p1 R, S, or T.');
const started=performance.now(),records=[],summary={matches:count,policies,rules:'lantern-rules-v1',content:'lantern-content-v1',profile:'v1-independent-4',rng:'hmac-sha256-counter-u32-v1',bot_versions:{R:'random-v1',S:'direct-attacker-v1',T:'tactical-four-turn-v1'},wins:[0,0],draws:{turn_cap:0,simultaneous_knockout:0},species:{},sets:{},types:{},comeback:{eligible:0,wins:0,draws:0},critical:{executed_attacks:0,hits:0,immediate_KO_threshold_changed:0},first_damaging_action:{eligible:0,score:0},turns:[]};
for(let i=0;i<count;i++){
 const seed=await sha256(campaign+'|'+i);let g=await createGame(seed),trail=null;const botRng=new Rng(seed);
 while(!g.outcome){const previousTurn=g.turn;for(const p of [0,1]){if(g.outcome)break;if(!project(g,p).required||g.pending[p])continue;g=await commit(g,p,g.gateId,await choose(g,p,policies[p],botRng));}
  if(g.turn!==previousTurn&&!g.outcome&&g.turn<=10&&trail===null){const a=alive(g,0).length,b=alive(g,1).length;if(a!==b&&Math.min(a,b)>=2)trail=a<b?0:1;}
 }
 await replay(g);summary.turns.push(g.turn);const score=p=>g.outcome.winner===null?.5:g.outcome.winner===p?1:0;if(g.outcome.winner===null)summary.draws[g.outcome.reason]++;else summary.wins[g.outcome.winner]++;
 if(trail!==null){summary.comeback.eligible++;if(g.outcome.winner===trail)summary.comeback.wins++;if(g.outcome.winner===null)summary.comeback.draws++;}
 const damage=g.events.filter(e=>e.kind==='damage');summary.critical.executed_attacks+=damage.length;summary.critical.hits+=damage.filter(e=>e.critical).length;
 // A critical's local threshold: undo only its multiplier at this event's stats.
 // Computed D is rounded, so this count is deliberately not inferred by division.
 if(damage[0]){summary.first_damaging_action.eligible++;summary.first_damaging_action.score+=score(damage[0].player);}
 for(const p of [0,1]){for(const m of g.sides[p].team)for(const [bucket,k]of [['species',m.monster_id],['sets',m.set_id]]){const entry=summary[bucket][k]??={containing_teams:0,score:0,leads:0,deployed:0};entry.containing_teams++;entry.score+=score(p);entry.leads+=g.commitments.some(c=>c.player===p&&c.phase==='lead'&&c.choice.slot===g.sides[p].team.indexOf(m))?1:0;entry.deployed+=g.events.some(e=>e.player===p&&e.slot===g.sides[p].team.indexOf(m)&&['lead','switch','replacement'].includes(e.kind))?1:0;}for(const t of new Set(g.sides[p].team.map(m=>SPECIES[m.monster_id].type))){const entry=summary.types[t]??={containing_teams:0,score:0};entry.containing_teams++;entry.score+=score(p);}}
 records.push({fixture:i,seed,policies,teams:g.sides.map(s=>s.team.map(m=>m.set_id)),turns:g.turn,outcome:g.outcome,critical_hits:damage.filter(e=>e.critical).length,bot_draws:botRng.trace});if((i+1)%25===0)console.log('Completed',i+1,'/',count);
}
summary.critical.immediate_KO_threshold_changed=null;summary.turns.sort((a,b)=>a-b);summary.median_turns=summary.turns[Math.floor(count/2)];summary.mean_turns=summary.turns.reduce((a,b)=>a+b,0)/count;summary.elapsed_seconds=(performance.now()-started)/1000;summary.note='One stable policy pairing per report. Containing-team scores are not duel strength. Threshold-changing criticals require event-by-event counterfactual replay; this report leaves them unmeasured. Human pace/fun and severe team matchup advantage are not inferred.';
await mkdir('reports',{recursive:true});await writeFile(out,JSON.stringify({summary,records},null,2));console.log(JSON.stringify(summary,null,2));
