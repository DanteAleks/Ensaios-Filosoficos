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
  const nasal=P.alphabet.find(letter=>letter.upper==='N');
  assert(nasal);
  assert.match(nasal.note,/nasal/i);
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
});

test('Build gera o portal Peregrini e entrega as três fontes web',()=>{
  execFileSync(process.execPath,['scripts/generate.mjs'],{cwd:root,stdio:'pipe'});
  execFileSync(process.execPath,['scripts/verify-site.mjs'],{cwd:root,stdio:'pipe'});
  const portal=fs.readFileSync(path.join(root,'dist/peregrini/index.html'),'utf8');
  assert.match(portal,/Área Peregrini/);
  assert.match(portal,/Maimônides/);
  assert.match(portal,/Alfabeto Peregrini/);
  assert.match(portal,/Prosseguir a via/);
  for(const file of ['PalavraPeregriniDisplay-Regular.woff2','PalavraPeregriniTexto-Regular.woff2','PalavraPeregriniIluminada-Regular.woff2']){
    assert(fs.statSync(path.join(root,'dist/fonts',file)).size>1000,file);
  }
});
