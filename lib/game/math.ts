import {SPECIES,MOVES,STATUS,effectiveness} from './content.ts';
import type {Battler,Stat,Move} from './types.ts';
export function effective(mon:Battler,stat:Stat){let n=BigInt(SPECIES[mon.monster_id].stats[stat]),d=1n;const mod=mon.modifiers[stat];if(mod){n*=BigInt(mod.numerator!);d*=BigInt(mod.denominator!);}for(const id of Object.keys(mon.statuses)){const f=STATUS[id]?.stat_modifiers[stat];if(f){n*=BigInt(f[0]);d*=BigInt(f[1]);}}return Math.max(1,Number(n/d));}
export function damage(attacker:Battler,target:Battler,move:Move|string,critical=false){const m=typeof move==='string'?MOVES[move]:move;if(m.category==='utility')return 0;
 const a=BigInt(effective(attacker,m.category)),f=BigInt(effective(target,m.category==='force'?'guard':'ward'));
 let n=BigInt(m.power)*a,d=a+f;const type=SPECIES[attacker.monster_id].type;
 const factors:[[number,number],[number,number],[number,number],[number,number]]=[m.type===type?[6,5]:[1,1],effectiveness(m.type,SPECIES[target.monster_id].type),critical?[5,4]:[1,1],target.reduction?[target.reduction.numerator!,target.reduction.denominator!]:[1,1]];
 for(const [num,den]of factors){n*=BigInt(num);d*=BigInt(den);}return Math.max(1,Number(n/d));
}
export function fractionHealth(mon:Battler,n:number,d:number){return Math.floor(SPECIES[mon.monster_id].stats.health*n/d);}
