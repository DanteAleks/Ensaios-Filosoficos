const test=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const M=require('../dist/admin/model.js'),G=require('../dist/admin/github.js');
const original=fs.readFileSync(require('node:path').join(__dirname,'../content/obras.json'),'utf8');
const clone=()=>JSON.parse(original);
test('Catalog roundtrip preserves all current text and metadata',()=>{assert.deepEqual(M.validate(M.parse(JSON.stringify(M.parse(original)))),clone());assert.throws(()=>M.parse('{"paragraphs":["first"],"paragraphs":["second"]}'),/repetido/);});
test('Paragraph entry generates a single valid list; unique IDs preserve URLs',()=>{assert.deepEqual(M.paragraphs('Primeiro.\n\nSegundo.\n\nTerceiro.'),['Primeiro.','Segundo.','Terceiro.']);const d=clone(),w=M.newWork(d,'Metafísica');assert.notEqual(w.id,'metafisica');d.works.push(w);assert.equal(M.validate(d),d);});
test('Only changed presentations receive an update date',()=>{const d=clone(),base=clone();d.works[0].variants[0].chapters[0].paragraphs.push('Novo parágrafo.');const ready=M.prepare(d,base,'2026-09-06');assert.equal(ready.works[0].variants[0].updated,'2026-09-06');assert.deepEqual(ready.works.slice(1),base.works.slice(1));assert.deepEqual(M.prepare(base,base,'2026-09-06'),base);});
test('Invalid empty chapter lists cannot be saved',()=>{const d=clone();d.works[0].variants[0].chapters=[];assert.throws(()=>M.validate(d),/capítulo/);});
test('Unicode survives GitHub base64 encoding',()=>{const text='Ж · Ontológica — criação 🌿\n'+original;assert.equal(G.decode(G.encode(text)),text);});
function server({login='DanteAleks',conflict=false,denied=false,uncertain=false}={}){
 const calls=[];let reads=0,text=original,sha='initial-sha';
 async function fetcher(url,options){calls.push({url,options});let body,status=200;
 if(url.endsWith('/user'))body={login};
 else if(url.endsWith('/repos/DanteAleks/Ensaios-Filosoficos'))body={owner:{login:'DanteAleks'},name:'Ensaios-Filosoficos',default_branch:'main'};
 else if(options.method==='PUT'){if(denied){status=403;body={};}else{const payload=JSON.parse(options.body);assert.equal(payload.sha,sha);assert.equal(payload.branch,'main');text=G.decode(payload.content);sha='saved-sha';if(uncertain)throw new TypeError('network');body={content:{sha},commit:{sha:'commit-sha',html_url:'https://github.com/DanteAleks/Ensaios-Filosoficos/commit/commit-sha'}};}}
 else{reads++;body={encoding:'base64',content:G.encode(text),sha:conflict&&reads>1?'other-sha':sha};}
 return {ok:status===200,status,json:async()=>body};
 }return {fetcher,calls};
}
test('Non-owner cannot connect or save',async()=>{const s=server({login:'someone-else'}),c=G.createClient(s.fetcher);await assert.rejects(c.connect('test-only-value'),/apenas a conta/);await assert.rejects(c.save('{}'),/Conecte/);assert(!s.calls.some(x=>x.options.method==='PUT'));});
test('Current owner saves only the catalog; token never goes in URL or body',async()=>{const s=server(),c=G.createClient(s.fetcher);await c.connect('test-only-value');await c.save(original);const writes=s.calls.filter(x=>x.options.method==='PUT');assert.equal(writes.length,1);assert.equal(writes[0].url,'https://api.github.com/repos/DanteAleks/Ensaios-Filosoficos/contents/content/obras.json');for(const call of s.calls){assert(!call.url.includes('test-only-value'));assert(!(call.options.body||'').includes('test-only-value'));assert.equal(call.options.credentials,'omit');assert.equal(call.options.redirect,'error');}c.disconnect();await assert.rejects(c.save(original),/Conecte/);});
test('Concurrent edits stop before any write',async()=>{const s=server({conflict:true}),c=G.createClient(s.fetcher);await c.connect('test-only-value');await assert.rejects(c.save(original),/mais recente/);assert(!s.calls.some(x=>x.options.method==='PUT'));});
test('Read-only token cannot claim successful save',async()=>{const s=server({denied:true}),c=G.createClient(s.fetcher);await c.connect('test-only-value');await assert.rejects(c.save(original),/não autorizou/);});
test('Ambiguous network failure is reconciled without a second write',async()=>{const s=server({uncertain:true}),c=G.createClient(s.fetcher);await c.connect('test-only-value');await c.save(original);assert.equal(s.calls.filter(x=>x.options.method==='PUT').length,1);});
