import raw from './content.json' with {type:'json'};
import type {Element,Move,Species,SetDefinition,Effect} from './types.ts';
export const CONTENT = raw;
export const TYPES = raw.types as Element[];
export const SPECIES = Object.fromEntries(raw.monsters.map(m=>[m.id,m])) as Record<string,Species>;
export const SETS = Object.fromEntries(raw.sets.map(s=>[s.id,s])) as Record<string,SetDefinition>;
export const MOVES = Object.fromEntries(raw.moves.map(m=>[m.id,m])) as Record<string,Move>;
export const STATUS = raw.statuses as unknown as Record<string,{name:string;duration:number;stat_modifiers:Record<string,[number,number]>;end_effects:Effect[]}>;
export function effectiveness(attack:Element|null,defense:Element):[number,number] {return attack ? raw.chart[TYPES.indexOf(attack)][TYPES.indexOf(defense)] as [number,number]:[1,1];}
export function validateContent(){
 for(const m of Object.values(SPECIES)){
  const s=m.stats, budget=4*s.health+4*Math.max(s.force,s.spirit)+Math.min(s.force,s.spirit)+2*(s.guard+s.ward+s.speed);
  if(budget<1300||budget>1340)throw Error('Invalid stat budget '+m.id);
  for(const [k,v]of Object.entries(s)){const [lo,hi]=k==='health'?[100,140]:k==='guard'||k==='ward'?[50,100]:[40,100];if(!Number.isInteger(v)||v<lo||v>hi)throw Error('Invalid stat '+m.id+':'+k);}
 }
 for(const s of Object.values(SETS)){
  const m=SPECIES[s.monster_id], moves=s.move_ids.map(id=>MOVES[id]);
  if(!m||s.weight!==1||moves.length!==4||new Set(s.move_ids).size!==4||moves.some(x=>!x))throw Error('Invalid set '+s.id);
  if(moves.filter(x=>x.power>0).length<2||!moves.some(x=>x.roles.includes('core_damage')&&x.type===m.type))throw Error('Invalid damage access '+s.id);
  if(moves.some(x=>x.roles.includes('core_damage')&&x.type!==m.type)||moves.filter(x=>x.power>0&&x.type!==m.type).length>1)throw Error('Invalid coverage '+s.id);
  if(s.move_ids.includes('M19')&&s.move_ids.includes('M23'))throw Error('Healing and brace in '+s.id);
 }
 for(const row of raw.chart){if(row.filter(x=>x[0]>x[1]).length!==2||row.filter(x=>x[0]<x[1]).length!==2)throw Error('Invalid type chart');}
 for(let i=0;i<TYPES.length;i++){if(raw.chart.filter(x=>x[i][0]>x[i][1]).length!==2||raw.chart.filter(x=>x[i][0]<x[i][1]).length!==2)throw Error('Invalid defense chart');}
}
