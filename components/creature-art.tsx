import {SPECIES} from '@/lib/game/content';

type SpriteView='front'|'back'|'icon';

export function CreatureArt({id,view='front',className=''}:{id:string;view?:SpriteView;className?:string}){
 const size=view==='icon'?32:80;
 return <img
  className={'creature-art creature-art-'+view+' '+className}
  src={'/sprites/'+id+'/'+view+'.png'}
  width={size} height={size}
  alt={(SPECIES[id]?.name??id)+(view==='back'?' · back view':'')}
  data-sprite-view={view}
  decoding="async" draggable={false}
 />;
}
