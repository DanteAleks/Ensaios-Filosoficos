const ORIGIN='https://dantealeks.github.io';
const MANIFEST=ORIGIN+'/Ensaios-Filosoficos/reactions-manifest.json';
const validWork=s=>typeof s==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*\/(didatico|sintetico)$/.test(s)&&s.length<=150;
const validId=s=>typeof s==='string'&&/^[a-f0-9]{32}$/.test(s);
async function digest(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');}
async function manifest(){const r=await fetch(MANIFEST,{cf:{cacheTtl:60,cacheEverything:true},signal:AbortSignal.timeout(8000)});if(!r.ok)throw Error('manifest');const list=await r.json();if(!Array.isArray(list))throw Error('manifest');return list;}
async function published(work){return (await manifest()).find(w=>w.id===work)||null;}
async function authorized(request,secret){if(typeof secret!=='string'||secret.length<32)return false;const token=request.headers.get('Authorization')||'';if(token.length>512)return false;const a=await digest(token),b=await digest('Bearer '+secret);let diff=0;for(let i=0;i<a.length;i++)diff|=a.charCodeAt(i)^b.charCodeAt(i);return diff===0;}
class InputError extends Error {constructor(message,status=400){super(message);this.status=status;}}
async function body(request){if(!request.headers.get('Content-Type')?.toLowerCase().startsWith('application/json'))throw new InputError('Formato inválido.',415);const reader=request.body?.getReader();if(!reader)throw new InputError('Envio vazio.');const chunks=[];let size=0;while(true){const {done,value}=await reader.read();if(done)break;size+=value.length;if(size>10000){await reader.cancel();throw new InputError('Mensagem muito grande.',413);}chunks.push(value);}const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}try{const value=JSON.parse(new TextDecoder().decode(bytes));if(!value||Array.isArray(value)||typeof value!=='object')throw Error();return value;}catch{throw new InputError('Envio inválido.');}}
async function rate(request,env,group,max){const ip=request.headers.get('CF-Connecting-IP');if(!ip)throw new InputError('Não foi possível validar o acesso.',403);const day=new Date().toISOString().slice(0,10),bucket=await digest(env.REACTION_SALT+'|rate|'+group+'|'+day+'|'+ip);const r=await env.DB.prepare('INSERT INTO rate_limits(bucket,day,attempts) VALUES(?,?,1) ON CONFLICT(bucket) DO UPDATE SET attempts=attempts+1 RETURNING attempts').bind(bucket,day).first();if(r.attempts>max)throw new InputError('Limite de envios atingido. Tente novamente amanhã.',429);await env.DB.prepare("DELETE FROM rate_limits WHERE day < date('now','-2 days')").run();}
export default {
 async fetch(request,env){
  const url=new URL(request.url),origin=request.headers.get('Origin');
  const headers={'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store','Vary':'Origin','X-Content-Type-Options':'nosniff'};
  if(origin===ORIGIN)headers['Access-Control-Allow-Origin']=ORIGIN;
  const reply=(data,status=200)=>new Response(JSON.stringify(data),{status,headers});
  // Public diagnostics contain only configuration names, never records or secrets.
  if(url.pathname==='/health'&&request.method==='GET'){
   const missing=[];if(!env.DB)missing.push('DB');if(typeof env.REACTION_SALT!=='string'||env.REACTION_SALT.length<32)missing.push('REACTION_SALT');if(typeof env.MESSAGES_ADMIN_KEY!=='string'||env.MESSAGES_ADMIN_KEY.length<32)missing.push('MESSAGES_ADMIN_KEY');
   if(env.DB)for(const table of ['reactions','rate_limits','private_messages'])try{await env.DB.prepare('SELECT 1 FROM '+table+' LIMIT 1').first();}catch{missing.push('table:'+table);}
   return reply({ready:!missing.length,missing},missing.length?503:200);
  }
  if(origin!==ORIGIN)return reply({error:'Origem não permitida.'},403);
  const routes={'/counts':'GET','/vote':'POST','/messages':'POST','/email-click':'POST','/admin/inbox':'GET','/admin/feedback':'GET','/admin/message':'POST'};
  if(!routes[url.pathname])return reply({error:'Não encontrado.'},404);
  if(request.method==='OPTIONS')return new Response(null,{status:204,headers:{...headers,'Access-Control-Allow-Methods':'GET, POST, OPTIONS','Access-Control-Allow-Headers':'Content-Type, Authorization','Access-Control-Max-Age':'600'}});
  if(request.method!==routes[url.pathname])return reply({error:'Método não permitido.'},405);
  if(url.pathname.startsWith('/admin/')&&!await authorized(request,env.MESSAGES_ADMIN_KEY))return reply({error:'Chave da caixa de entrada inválida.'},401);
  if(!env.DB||typeof env.REACTION_SALT!=='string'||env.REACTION_SALT.length<32)return reply({error:'Serviço indisponível no momento.',code:'SETUP_REQUIRED'},503);
  try{
   const count=async work=>Number((await env.DB.prepare("SELECT COUNT(*) AS likes FROM reactions WHERE work=? AND value='like'").bind(work).first()).likes);
   if(url.pathname==='/counts'){const work=url.searchParams.get('work');if(!validWork(work))throw new InputError('Texto inválido.');return reply({likes:await count(work)});}
   if(url.pathname==='/admin/inbox'){
    const raw=url.searchParams.get('before'),before=raw===null?Number.MAX_SAFE_INTEGER:Number(raw);if(!Number.isSafeInteger(before)||before<1)throw new InputError('Página inválida.');
    const rows=await env.DB.prepare('SELECT id,kind,work,title,name,email,message,status,created_at FROM private_messages WHERE id < ? ORDER BY id DESC LIMIT 26').bind(before).all();
    const items=rows.results.slice(0,25),unread=Number((await env.DB.prepare("SELECT COUNT(*) AS n FROM private_messages WHERE status='new'").first()).n);
    return reply({items,unread,next:rows.results.length>25?items.at(-1).id:null});
   }
   if(url.pathname==='/admin/feedback'){
    const rows=await env.DB.prepare("SELECT work, SUM(CASE WHEN value='like' THEN 1 ELSE 0 END) AS likes, SUM(CASE WHEN value='dislike' THEN 1 ELSE 0 END) AS dislikes FROM reactions GROUP BY work").all();
    const counts=new Map(rows.results.map(row=>[row.work,{likes:Number(row.likes)||0,dislikes:Number(row.dislikes)||0}]));
    const items=(await manifest()).map(entry=>{const count=counts.get(entry.id)||{likes:0,dislikes:0};return {work:entry.id,title:entry.title,format:entry.format,likes:count.likes,dislikes:count.dislikes};});
    return reply({items});
   }
   const data=await body(request);
   if(url.pathname==='/admin/message'){
    const {id,status}=data;if(!Number.isSafeInteger(id)||id<1||!['read','replied','archived','delete'].includes(status))throw new InputError('Ação inválida.');
    const result=status==='delete'?await env.DB.prepare('DELETE FROM private_messages WHERE id=?').bind(id).run():await env.DB.prepare('UPDATE private_messages SET status=? WHERE id=?').bind(status,id).run();
    if(!result.meta?.changes)return reply({error:'Mensagem não encontrada.'},404);return reply({ok:true});
   }
   const {work}=data;if(!validWork(work))throw new InputError('Texto inválido.');
   if(url.pathname==='/vote'){
    const {voter,value}=data;if(!validId(voter)||!['like','dislike','none'].includes(value))throw new InputError('Avaliação inválida.');
    await rate(request,env,'vote',60);if(!await published(work))throw new InputError('Este texto ainda não está disponível para avaliação.',404);
    const id=await digest(env.REACTION_SALT+'|voter|'+voter);
    if(value==='none')await env.DB.prepare('DELETE FROM reactions WHERE work=? AND voter=?').bind(work,id).run();else await env.DB.prepare('INSERT INTO reactions(work,voter,value) VALUES(?,?,?) ON CONFLICT(work,voter) DO UPDATE SET value=excluded.value,updated_at=CURRENT_TIMESTAMP').bind(work,id,value).run();
    return reply({likes:await count(work),selection:value});
   }
   if(typeof env.MESSAGES_ADMIN_KEY!=='string'||env.MESSAGES_ADMIN_KEY.length<32)return reply({error:'Mensagens indisponíveis no momento.',code:'SETUP_REQUIRED'},503);
   const kind=url.pathname==='/messages'?'message':'email_click';const {requestId}=data;if(!validId(requestId))throw new InputError('Identificador inválido.');
   let name='',email='',message='';
   if(kind==='message'){
    if(typeof data.email!=='string'||typeof data.message!=='string')throw new InputError('Preencha os campos da mensagem.');
    name=typeof data.name==='string'?data.name.trim():'';email=data.email.trim();message=data.message.trim();
    if(name.length>100||email.length>254||!/^[^\s@<>,;:"\\]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(email)||message.length<10||message.length>4000)throw new InputError('Informe um e-mail válido e uma mensagem entre 10 e 4000 caracteres.');
   }
   await rate(request,env,kind,kind==='message'?10:30);
   const record=await published(work);if(!record||typeof record.title!=='string')throw new InputError('Texto ainda não disponível. Tente novamente mais tarde.',404);
   const payloadHash=await digest(JSON.stringify({kind,work,name,email,message}));
   await env.DB.prepare('INSERT INTO private_messages(request_id,payload_hash,kind,work,title,name,email,message) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(request_id) DO NOTHING').bind(requestId,payloadHash,kind,work,record.title.slice(0,500),name,email,message).run();
   const existing=await env.DB.prepare('SELECT payload_hash FROM private_messages WHERE request_id=?').bind(requestId).first();
   if(existing.payload_hash!==payloadHash)throw new InputError('O envio anterior já foi recebido. Recarregue a página para enviar outra mensagem.',409);
   return reply({ok:true});
  }catch(e){if(e instanceof InputError)return reply({error:e.message},e.status);return reply({error:'Não foi possível confirmar a operação. Tente novamente.'},503);}
 }
};
