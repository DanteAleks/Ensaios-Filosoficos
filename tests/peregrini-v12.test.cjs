const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const P=require('../dist/peregrini-language.js');
const D=require('../dist/document.js');
const M=require('../dist/admin/model.js');

test('Inventário Peregrini mantém as 28 letras e a regra de nasalização',()=>{
  assert.equal(P.alphabet.length,28);
  assert.equal(P.vowels.length,7);
  assert.deepEqual(P.vowels.map(v=>v.upper),['A','E','И','Я','Ю','O','Y']);
  const nasal=P.alphabet.find(letter=>letter.upper==='N');
  assert(nasal);
  assert.match(nasal.note,/nasal/i);
  assert.equal(nasal.examples.length,P.vowels.length);
  assert.equal(P.isPeregrini({language:'peregrini'}),true);
  assert.equal(P.isPeregrini({language:'pt-BR'}),false);
});

test('Nova obra Peregrini nasce com direção visual RTL e capitular',()=>{
  const data={author:'Aleks',works:[]};
  const work=M.newPeregriniWork(data,'Primeiro escrito');
  assert.equal(work.language,'peregrini');
  assert.equal(work.direction,'rtl');
  assert.equal(work.variants[0].blocks[0].direction,'rtl');
  assert.equal(work.variants[0].blocks[0].initial,'illuminated');
  data.works.push(work);
  assert.equal(M.validate(data,{draft:true}),data);
  const html=D.render(work.variants[0].blocks);
  assert.match(html,/dir="rtl"/);
  assert.match(html,/initial-illuminated/);
  assert(!html.includes('float'));
});

test('Capitular permanece junto da palavra e as fontes Peregrini podem ser persistidas',()=>{
  const blocks=[{tag:'p',direction:'rtl',initial:'illuminated',runs:[{text:'Peregrini',font:'peregrini-text',bold:true}]}];
  const html=D.render(blocks);
  assert.match(html,/initial-illuminated-letter/);
  assert(!html.includes('float'));
  assert.match(html,/font-peregrini-text/);
  assert(D.valid(D.parseDOM(require('jsdom').JSDOM.fragment(html))));
});

test('Editor Peregrini oferece os dois casos e fixa a direção em todos os blocos',()=>{
  const {JSDOM}=require('jsdom');
  const dom=new JSDOM('<div id="host"></div>',{runScripts:'outside-only'}),w=dom.window;
  w.PeregriniDocument=D;w.PeregriniLanguage=P;
  w.eval(fs.readFileSync(path.join(root,'dist/admin/peregrini-editor.js'),'utf8'));
  const version={direction:'rtl',blocks:[{tag:'p',direction:'rtl',runs:[{text:'AB'}]}],chapters:[]};
  w.mountPeregriniEditor(w.document.getElementById('host'),version,()=>{});
  assert.equal(w.document.querySelectorAll('[data-case="maiúscula"]').length,28);
  assert.equal(w.document.querySelectorAll('[data-case="minúscula"]').length,28);
  assert.equal(w.document.querySelector('.document-editor').dir,'rtl');
  w.document.querySelector('[data-case="minúscula"]').click();
  assert.equal(version.blocks.map(b=>b.runs.map(r=>r.text).join('')).join(''),'ABa');
  w.document.querySelector('[data-peregrini-direction]').click();
  assert.equal(version.direction,'ltr');
  assert(version.blocks.every(b=>b.direction==='ltr'));
  dom.window.close();
});

test('Build gera o portal Peregrini e entrega as três fontes web',()=>{
  execFileSync(process.execPath,['scripts/generate.mjs'],{cwd:root,stdio:'pipe'});
  execFileSync(process.execPath,['scripts/verify-site.mjs'],{cwd:root,stdio:'pipe'});
  const portal=fs.readFileSync(path.join(root,'dist/peregrini/index.html'),'utf8');
  assert.match(portal,/Área Peregrini/);
  assert.match(portal,/Maimônides/);
  assert.match(portal,/Alfabeto Peregrini/);
  assert.match(portal,/Prosseguir a via/);
  assert.match(portal,/href="\.\/via\.html"/);
  assert.match(portal,/Exemplos com vogais/);
  assert(!portal.includes('<th scope="col">Estado</th>'));
  const via=fs.readFileSync(path.join(root,'dist/peregrini/via.html'),'utf8');
  assert.match(via,/Entrar nos escritos/);
  assert.match(via,/index\.html#escritos-peregrini/);
  for(const value of ['peregrini-text','peregrini-display','peregrini-iluminada'])assert.match(fs.readFileSync(path.join(root,'dist/obras/metafisica-recuperado/didatico.html'),'utf8'),new RegExp(`value="${value}"`));
  for(const file of ['PalavraPeregriniDisplay-Regular.woff2','PalavraPeregriniTexto-Regular.woff2','PalavraPeregriniIluminada-Regular.woff2']){
    assert(fs.statSync(path.join(root,'dist/fonts',file)).size>1000,file);
  }
});
