// Cloudflare Worker. DB binding and REACTION_SALT secret are configured in the dashboard.
const ORIGIN='https://dantealeks.github.io';
const MANIFEST=ORIGIN+'/Ensaios-Filosoficos/reactions-manifest.json';
const validWork=s=>typeof s==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*\/(didatico|sintetico)$/.test(s)&&s.length<=150;
async function digest(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');}
async function published(work){const r=await fetch(MANIFEST,{cf:{cacheTtl:60,cacheEverything:true},signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('manifest');const list=await r.json();return Array.isArray(list)&&list.some(w=>w.id===work);}
export default {
 async fetch(request,env){
  const origin=request.headers.get('Origin');
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
  if(origin===ORIGIN)headers['Access-Control-Allow-Origin']=ORIGIN;
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  if(origin!==ORIGIN)return reply({error:'Origem não permitida.'},403);
  const url=new URL(request.url);
  if(!['/counts','/vote'].includes(url.pathname))return reply({error:'Não encontrado.'},404);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type','Access-Control-Max-Age':'600'}});
  if((url.pathname==='/counts'&&request.method!=='GET')||(url.pathname==='/vote'&&request.method!=='POST'))return reply({error:'Método não permitido.'},405);
  if(!env.DB||typeof env.REACTION_SALT!=='string'||env.REACTION_SALT.length<32)return reply({error:'Serviço ainda não configurado.'},503);
  try{
   const count=async work=>Number((await env.DB.prepare("SELECT COUNT(*) AS likes FROM reactions WHERE work=? AND value='like'").bind(work).first()).likes);
   if(url.pathname==='/counts'){
    const work=url.searchParams.get('work');if(!validWork(work))return reply({error:'Texto inválido.'},400);
    return reply({likes:await count(work)});
   }
   if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))return reply({error:'Formato inválido.'},415);
   // Enforce a bound even when no Content-Length is supplied.
   const reader=request.body?.getReader();if(!reader)return reply({error:'Envio vazio.'},400);
   let chunks=[],size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>1024){await reader.cancel();return reply({error:'Envio muito grande.'},413);}chunks.push(value);}
   const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
   let body;try{body=JSON.parse(new TextDecoder().decode(bytes));}catch{return reply({error:'Envio inválido.'},400);}
   const {work,voter,value}=body||{};
   if(!validWork(work)||typeof voter!=='string'||!/^[a-f0-9]{32}$/.test(voter)||!['like','dislike','none'].includes(value))return reply({error:'Avaliação inválida.'},400);
   const ip=request.headers.get('CF-Connecting-IP');if(!ip)return reply({error:'Não foi possível validar o acesso.'},403);
   const day=new Date().toISOString().slice(0,10),bucket=await digest(env.REACTION_SALT+'|rate|'+day+'|'+ip);
   const limit=await env.DB.prepare('INSERT INTO rate_limits(bucket,day,attempts) VALUES(?,?,1) ON CONFLICT(bucket) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(bucket,day).first();
   if(limit.attempts>60)return reply({error:'Limite de avaliações atingido. Tente novamente amanhã.'},429);
   if(!await published(work))return reply({error:'Este texto ainda não está disponível para avaliação.'},404);
   const id=await digest(env.REACTION_SALT+'|voter|'+voter);
   if(value==='none')await env.DB.prepare('DELETE FROM reactions WHERE work=? AND voter=?').bind(work,id).run();
   else await env.DB.prepare('INSERT INTO reactions(work,voter,value) VALUES(?,?,?) ON CONFLICT(work,voter) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP').bind(work,id,value).run();
   await env.DB.prepare("DELETE FROM rate_limits WHERE day < date('now','-2 days')").run();
   // No endpoint returns dislike counts, total votes, voter IDs or raw rows.
   return reply({likes:await count(work),selection:value});
  }catch{return reply({error:'Não foi possível confirmar a avaliação. Tente novamente.'},503);}
 }
};
