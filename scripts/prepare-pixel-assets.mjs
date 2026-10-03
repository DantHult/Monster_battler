// Raster preparation only; creature and landscape drawings come from generated artwork.
// Requires ImageMagick 6+ for PNG decoding/encoding. All resizing uses point samples.
import {spawnSync} from 'node:child_process';
import {readFileSync,writeFileSync,mkdirSync} from 'node:fs';
import {resolve,join} from 'node:path';

const source=resolve(process.argv[2]??'art/source');
const target=resolve('public');
const content=JSON.parse(readFileSync('lib/game/content.json','utf8'));
const monsters=content.monsters??content.species;
if(!monsters?.length)throw Error('Missing creature catalogue');
const authoredPalettes=JSON.parse(readFileSync('art/palettes.json','utf8'));
const run=(args,input)=>{
 const r=spawnSync('convert',args,{input,maxBuffer:64*1024*1024});
 if(r.status!==0)throw Error(r.stderr.toString()||'ImageMagick failed');
 return r.stdout;
};
function load(path){
 const [width,height]=run([path,'-format','%w %h','info:']).toString().trim().split(' ').map(Number);
 return {width,height,data:run([path,'-alpha','on','-depth','8','rgba:-'])};
}
function save(path,img){
 mkdirSync(resolve(path,'..'),{recursive:true});
 run(['-size',img.width+'x'+img.height,'-depth','8','rgba:-','-define','png:color-type=6',path],img.data);
}
const rgb=(hex)=>[1,3,5].map(i=>parseInt(hex.slice(i,i+2),16));
const hex=(color)=>'#'+color.map(v=>v.toString(16).padStart(2,'0')).join('');
function bounds(img){
 let x0=img.width,y0=img.height,x1=-1,y1=-1;
 for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++)if(img.data[(y*img.width+x)*4+3]===255){x0=Math.min(x,x0);x1=Math.max(x,x1);y0=Math.min(y,y0);y1=Math.max(y,y1);}
 if(x1<0)throw Error('Empty sprite');
 return {x:x0,y:y0,width:x1-x0+1,height:y1-y0+1};
}
function cell(sheet,index){
 const x0=Math.round(index%4*sheet.width/4),x1=Math.round((index%4+1)*sheet.width/4);
 const rowStart=Math.round(Math.floor(index/4)*sheet.height/3),rowEnd=Math.round((Math.floor(index/4)+1)*sheet.height/3);
 // Preserve a tip crossing a row boundary; reject fragments belonging to other rows.
 const y0=Math.max(0,rowStart-20),y1=Math.min(sheet.height,rowEnd+20);
 const img={width:x1-x0,height:y1-y0,data:Buffer.alloc((x1-x0)*(y1-y0)*4)};
 for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++){
  const from=((y+y0)*sheet.width+x+x0)*4,to=(y*img.width+x)*4;
  if(sheet.data[from+3]>=176){sheet.data.copy(img.data,to,from,from+3);img.data[to+3]=255;}
 }
 const visited=new Uint8Array(img.width*img.height),components=[];
 for(let p=0;p<visited.length;p++)if(!visited[p]&&img.data[p*4+3]){
  const queue=[p],pixels=[];let minY=img.height,maxY=-1;
  while(queue.length){
   const next=queue.pop();if(visited[next])continue;visited[next]=1;pixels.push(next);
   const x=next%img.width,y=Math.floor(next/img.width);minY=Math.min(minY,y);maxY=Math.max(maxY,y);
   for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
    const xx=x+dx,yy=y+dy,n=yy*img.width+xx;
    if(xx>=0&&xx<img.width&&yy>=0&&yy<img.height&&!visited[n]&&img.data[n*4+3])queue.push(n);
   }
  }
  components.push({pixels,minY,maxY});
 }
 components.sort((a,b)=>b.pixels.length-a.pixels.length);
 for(const c of components.slice(1))if(c.pixels.length<8||c.minY<=rowStart-y0||c.maxY>=rowEnd-y0-1){
  for(const p of c.pixels)img.data.fill(0,p*4,p*4+4);
 }
 return img;
}
function sample(img,width,height,crop={x:0,y:0,width:img.width,height:img.height}){
 const out={width,height,data:Buffer.alloc(width*height*4)};
 for(let y=0;y<height;y++)for(let x=0;x<width;x++){
  const sx=crop.x+Math.min(crop.width-1,Math.floor((x+.5)*crop.width/width));
  const sy=crop.y+Math.min(crop.height-1,Math.floor((y+.5)*crop.height/height));
  const from=(sy*img.width+sx)*4,to=(y*width+x)*4;
  img.data.copy(out.data,to,from,from+4);
 }
 return out;
}
function frame(img,size){
 const b=bounds(img),extent=size===80?72:28;
 const ratio=extent/Math.max(b.width,b.height);
 const w=Math.round(b.width*ratio),h=Math.round(b.height*ratio);
 const scaled=sample(img,w,h,b),out={width:size,height:size,data:Buffer.alloc(size*size*4)};
 const dx=Math.floor((size-w)/2),dy=size-(size===80?4:2)-h;
 for(let y=0;y<h;y++)scaled.data.copy(out.data,((dy+y)*size+dx)*4,y*w*4,(y+1)*w*4);
 return out;
}
// Weighted, deterministic palette clustering. No dithering or blended output pixels.
function palette(images,count,fixed=[]){
 const histogram=new Map();
 for(const img of images)for(let i=0;i<img.data.length;i+=4)if(img.data[i+3]){
  const color=[img.data[i],img.data[i+1],img.data[i+2]];
  const key=color.map(v=>v>>4).join(',');
  const point=histogram.get(key)??{color:[0,0,0],weight:0};
  point.weight++;for(let c=0;c<3;c++)point.color[c]+=color[c];histogram.set(key,point);
 }
 const points=[...histogram.values()].map(p=>({weight:p.weight,color:p.color.map(v=>v/p.weight)}));
 const distance=(a,b)=>.25*(a[0]-b[0])**2+.5*(a[1]-b[1])**2+.25*(a[2]-b[2])**2;
 const centers=fixed.map(c=>[...c]);
 if(!centers.length)centers.push([...points.reduce((a,b)=>b.weight>a.weight?b:a).color]);
 while(centers.length<Math.min(count,points.length)){
  const p=points.reduce((best,p)=>{
   const score=Math.min(...centers.map(c=>distance(p.color,c)))*Math.sqrt(p.weight);
   return score>best.score?{point:p,score}:best;
  },{point:points[0],score:-1}).point;
  centers.push([...p.color]);
 }
 for(let step=0;step<24;step++){
  const totals=centers.map(()=>({weight:0,color:[0,0,0]}));
  for(const p of points){const ds=centers.map(c=>distance(p.color,c));const t=totals[ds.indexOf(Math.min(...ds))];t.weight+=p.weight;for(let c=0;c<3;c++)t.color[c]+=p.color[c]*p.weight;}
  for(let i=fixed.length;i<centers.length;i++)if(totals[i].weight)centers[i]=totals[i].color.map(v=>v/totals[i].weight);
 }
 const colors=centers.map(c=>c.map(v=>Math.max(1,Math.min(255,Math.round(v)))));
 return [...new Map(colors.map(c=>[hex(c),c])).values()];
}
function remap(img,colors,outline){
 const mask=Uint8Array.from({length:img.width*img.height},(_,i)=>img.data[i*4+3]?1:0);
 for(let y=0;y<img.height;y++)for(let x=0;x<img.width;x++){
  const i=(y*img.width+x)*4;
  if(!mask[y*img.width+x])continue;
  let edge=false;
  if(outline)for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){
   const nx=x+dx,ny=y+dy;if(nx<0||ny<0||nx>=img.width||ny>=img.height||!mask[ny*img.width+nx])edge=true;
  }
  const value=[img.data[i],img.data[i+1],img.data[i+2]];
  const color=edge?outline:colors.reduce((a,b)=>{
   const dist=c=>.25*(value[0]-c[0])**2+.5*(value[1]-c[1])**2+.25*(value[2]-c[2])**2;
   return dist(b)<dist(a)?b:a;
  });
  for(let c=0;c<3;c++)img.data[i+c]=color[c];img.data[i+3]=255;
 }
 return img;
}
function atlas(images,size){
 const out={width:size*4,height:size*3,data:Buffer.alloc(size*4*size*3*4)};
 for(let n=0;n<images.length;n++)for(let y=0;y<size;y++){
  const to=((Math.floor(n/4)*size+y)*out.width+n%4*size)*4;
  images[n].data.copy(out.data,to,y*size*4,(y+1)*size*4);
 }
 return out;
}
const sheets={front:load(join(source,'front-atlas-source.png')),back:load(join(source,'back-atlas-source.png')),icon:load(join(source,'icon-atlas-source.png'))};
const prepared={front:[],back:[],icon:[]};
const manifest={version:'pixel-v1',animation:false,grid:{front:[80,80],back:[80,80],icon:[32,32]},rendering:'nearest-neighbor',lighting:'top-left',creatures:[],atlases:{front:{path:'/sprites/front-atlas.png',columns:4,rows:3,cell:[80,80]},back:{path:'/sprites/back-atlas.png',columns:4,rows:3,cell:[80,80]},icon:{path:'/sprites/icon-atlas.png',columns:4,rows:3,cell:[32,32]}}};
for(let n=0;n<12;n++){
 const m=monsters[n],frames={front:frame(cell(sheets.front,n),80),back:frame(cell(sheets.back,n),80),icon:frame(cell(sheets.icon,n),32)};
 const authored=authoredPalettes[m.id],outline=rgb(authored.outline);
 const colors=[...new Set([authored.outline,...Object.values(authored.materials).flat(),...authored.accents])].map(rgb);
 if(colors.length>20)throw Error(m.id+' palette exceeds 20 colors');
 const entry={id:m.id,name:m.name,type:m.type,palette:colors.map(hex),materials:authored.materials,outline:authored.outline,files:{},frames:{}};
 for(const [view,img] of Object.entries(frames)){
  remap(img,colors,outline);prepared[view].push(img);
  const path='/sprites/'+m.id+'/'+view+'.png';save(join(target,path),img);entry.files[view]=path;
  entry.frames[view]={x:n%4*img.width,y:Math.floor(n/4)*img.height,width:img.width,height:img.height,bounds:bounds(img),pivot:[Math.floor(img.width/2),img.height-(view==='icon'?2:4)]};
 }
 manifest.creatures.push(entry);
}
for(const [view,images]of Object.entries(prepared))save(join(target,'sprites',view+'-atlas.png'),atlas(images,view==='icon'?32:80));
const scenery=sample(load(join(source,'battle-background-source.png')),256,144);
// Flatten the sky's incidental rendering variations while retaining clouds and hills.
const skyColor=[131,184,179],first=[...scenery.data.subarray(0,3)],seen=new Set(),queue=[0];
while(queue.length){
 const p=queue.pop();if(seen.has(p))continue;seen.add(p);
 const x=p%scenery.width,y=Math.floor(p/scenery.width),i=p*4;
 if(y>58||Math.max(...first.map((c,k)=>Math.abs(c-scenery.data[i+k])))>43)continue;
 skyColor.forEach((c,k)=>{scenery.data[i+k]=c;});
 if(x>0)queue.push(p-1);if(x<255)queue.push(p+1);if(y>0)queue.push(p-256);if(y<143)queue.push(p+256);
}
const baseSceneryPalette=palette([scenery],24,[skyColor]);remap(scenery,baseSceneryPalette);
// Palette-only scenery edits retain every original terrain and platform pixel.
const battlefieldColors=JSON.parse(readFileSync('art/battlefield-colors.json','utf8'));
for(let i=0;i<scenery.data.length;i+=4){
 const original=hex([...scenery.data.subarray(i,i+3)]),replacement=battlefieldColors.replacements[original];
 if(replacement)rgb(replacement).forEach((c,k)=>{scenery.data[i+k]=c;});
}
const sceneryPalette=baseSceneryPalette.map(c=>rgb(battlefieldColors.replacements[hex(c)]??hex(c)));
save(join(target,'battle/background.png'),scenery);
save(join(target,'battle/background-mobile.png'),sample(scenery,176,144));
manifest.battlefield={colorVersion:battlefieldColors.version,path:'/battle/background.png',size:[256,144],mobilePath:'/battle/background-mobile.png',mobileSize:[176,144],palette:sceneryPalette.map(hex),platformCenters:{player:[72,114],opponent:[192,88]},spriteOrigins:{player:[32,38],opponent:[152,12]},mobileSpriteOrigins:{player:[9,38],opponent:[92,12]}};
writeFileSync(join(target,'sprites/manifest.json'),JSON.stringify(manifest,null,2)+'\n');
console.log('Prepared 36 PNG sprites, 3 atlases, 2 battlefield PNGs, and manifest.json.');
