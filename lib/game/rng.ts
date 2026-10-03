import type {DrawTrace} from './types.ts';
const encoder=new TextEncoder();
export function bytes(hex:string){if(!/^[0-9a-f]{64}$/.test(hex))throw Error('Seed must be 256-bit lowercase hex');return Uint8Array.from(hex.match(/../g)!,x=>parseInt(x,16));}
export async function hmac(key:Uint8Array,message:string){const k=await crypto.subtle.importKey('raw',key as BufferSource,{name:'HMAC',hash:'SHA-256'},false,['sign']);return new Uint8Array(await crypto.subtle.sign('HMAC',k,encoder.encode(message)));}
export class Rng {
 seed:string; counters:Record<string,number>; trace:DrawTrace[]; keys=new Map<string,Promise<CryptoKey>>();
 constructor(seed:string,counters:Record<string,number>={},trace:DrawTrace[]=[]){bytes(seed);this.seed=seed;this.counters=counters;this.trace=trace;}
 async int(stream:string,bound:number){
  if(!Number.isInteger(bound)||bound<1||bound>4294967296)throw Error('Invalid random bound');
  if(!this.keys.has(stream))this.keys.set(stream,hmac(bytes(this.seed),'mb-rng-v1|'+stream).then(k=>crypto.subtle.importKey('raw',k as BufferSource,{name:'HMAC',hash:'SHA-256'},false,['sign'])));
  const key=await this.keys.get(stream)!, limit=bound*Math.floor(4294967296/bound);
  for(;;){const counter=this.counters[stream]??0;if(counter>=4294967296)throw Error('RNG stream exhausted');this.counters[stream]=counter+1;
   const digest=await crypto.subtle.sign('HMAC',key,encoder.encode('draw|'+counter));const word=new DataView(digest).getUint32(0,false),rejected=word>=limit;
   this.trace.push({stream,counter,word,bound,rejected,...(!rejected?{result:word%bound}:{})});if(!rejected)return word%bound;
  }
 }
}
export async function sha256(text:string){return [...new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(text)))].map(x=>x.toString(16).padStart(2,'0')).join('');}
export function randomSeed(){return [...crypto.getRandomValues(new Uint8Array(32))].map(x=>x.toString(16).padStart(2,'0')).join('');}
