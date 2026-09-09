const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const P=require('../dist/peregrini-language.js');
const M=require('../dist/admin/model.js');
const root=path.resolve(__dirname,'..');

test('Percurso público: início → apresentação → escritos → idioma',()=>{
  const read=name=>new JSDOM(fs.readFileSync(path.join(root,'dist',name),'utf8'));
  const home=read('index.html'),via=read('peregrini/via.html'),portal=read('peregrini/index.html'),language=read('peregrini/idioma.html');
  try{
    assert.equal(home.window.document.querySelector('.peregrini-entry').getAttribute('href'),'./peregrini/via.html');
    assert.equal(home.window.document.querySelector('.peregrini-entry bdo').dir,'rtl');
    const enter=via.window.document.querySelector('.primary-button');
    assert.equal(enter.getAttribute('href'),'./index.html');
    assert.match(enter.textContent,/Prosseguir Área Peregrini/);
    assert.equal(portal.window.document.querySelector('table'),null);
    assert(portal.window.document.querySelector('#escritos-peregrini'));
    assert.equal(portal.window.document.querySelector('.language-door').getAttribute('href'),'./idioma.html');
    assert(language.window.document.querySelector('#vocabulario'));
    const yes=language.window.document.querySelector('[data-term="ДA"] bdo');
    assert.equal(yes.dir,'rtl');assert.equal(yes.textContent,'ДA');
    assert.equal(language.window.document.querySelectorAll('tbody tr').length,28);
    for(const row of language.window.document.querySelectorAll('tbody tr')){
      assert.equal(row.querySelectorAll('.vowel-word-examples li').length,7);
      assert([...row.querySelectorAll('.vowel-word-examples li span')].every(el=>el.textContent.trim()));
    }
  }finally{[home,via,portal,language].forEach(dom=>dom.window.close());}
});

test('Busca pública filtra significado, pronúncia e inicial sem alterar a grafia',()=>{
  const dom=new JSDOM(fs.readFileSync(path.join(root,'dist/peregrini/idioma.html'),'utf8'),{runScripts:'outside-only'});
  const w=dom.window;w.PeregriniLanguage=P;
  try{
    w.eval(fs.readFileSync(path.join(root,'dist/vocabulary.js'),'utf8'));
    const query=w.document.querySelector('#vocabulary-query'),letter=w.document.querySelector('#vocabulary-letter'),order=w.document.querySelector('#vocabulary-order');
    const visible=()=>[...w.document.querySelectorAll('[data-vocabulary-entry]')].filter(el=>!el.hidden);
    query.value='nao';query.dispatchEvent(new w.Event('input'));
    assert.equal(visible().length,1);assert.equal(visible()[0].dataset.term,'HИET');
    query.value='ausente123';query.dispatchEvent(new w.Event('input'));
    assert.equal(w.document.querySelector('[data-vocabulary-empty]').hidden,false);
    query.value='';query.dispatchEvent(new w.Event('input'));
    letter.value='C';letter.dispatchEvent(new w.Event('change'));
    assert.deepEqual(visible().map(el=>el.dataset.term),['CAV','CЛOVO']);
    order.value='reverse';order.dispatchEvent(new w.Event('change'));
    assert.deepEqual(visible().map(el=>el.dataset.term),['CЛOVO','CAV']);
    assert.equal(P.filterLexicon([{term:'A',meaning:'Teste',pronunciation:'água'}],{query:'agua'}).length,1);
  }finally{dom.window.close();}
});

test('Ordem alfabética usa o alfabeto Peregrini e mantém P, П, R distintos',()=>{
  const terms=['R','P','П','N','H','И','Д','Г','A','Л'].map(term=>({term,meaning:'Som'}));
  assert.deepEqual(P.filterLexicon(terms).map(x=>x.term),['A','Д','И','Г','Л','H','П','P','R','N']);
  assert.equal(P.filterLexicon([{term:'ДA',meaning:'Sim'}],{query:'дa'}).length,1);
  assert.equal(terms[0].term,'R');
});

test('Vocabulário sobrevive ao catálogo, à publicação e à recuperação de rascunho',()=>{
  const original=M.parse(fs.readFileSync(path.join(root,'content/obras.json'),'utf8'));
  const draft=M.clone(original);draft.peregrini={lexicon:P.settings().lexicon};
  draft.peregrini.lexicon.push({term:'TESTE',meaning:'Exemplo de teste',pronunciation:'teste',example:'ДA'});
  const next=M.prepare(draft,original,'2026-09-09');
  assert.deepEqual(next.works,original.works);
  assert.deepEqual(M.validate(M.parse(JSON.stringify(next))).peregrini,draft.peregrini);
  const recovered=M.mergeDraft(original,draft,original).data;
  assert.deepEqual(recovered.peregrini,draft.peregrini);
  const changed=M.clone(original);changed.peregrini={lexicon:[{term:'A',meaning:'Outra edição'}]};
  assert.throws(()=>M.mergeDraft(changed,draft,original),/vocabulário foi alterado/);
  assert.deepEqual(changed.peregrini.lexicon,[{term:'A',meaning:'Outra edição'}]);
  draft.peregrini.lexicon.push({term:'дa',meaning:'Repetida'});
  assert.throws(()=>M.validate(draft),/vocabulário/);
});

test('Novo formulário permite adicionar, editar e remover sem criar HTML executável',()=>{
  const dom=new JSDOM('<div id="host"></div>',{runScripts:'outside-only'}),w=dom.window;
  w.PeregriniLanguage=P;w.confirm=()=>true;
  const data={author:'Autor',works:[]};let changes=0;
  try{
    w.eval(fs.readFileSync(path.join(root,'dist/admin/vocabulary-editor.js'),'utf8'));
    w.mountVocabularyEditor(w.document.querySelector('#host'),data,()=>changes++);
    const form=w.document.querySelector('form');
    const submit=()=>form.dispatchEvent(new w.Event('submit',{bubbles:true,cancelable:true}));
    form.elements.term.value='A';form.elements.meaning.value='<img src=x onerror=alert(1)> Uma palavra.';form.elements.pronunciation.value='a';form.elements.partOfSpeech.value='substantivo';
    submit();
    assert.equal(changes,1);assert.equal(data.peregrini.lexicon.at(-1).term,'A');
    assert.equal(w.document.querySelector('img'),null);
    form.elements.term.value='a';form.elements.meaning.value='Repetida';form.elements.partOfSpeech.value='substantivo';submit();
    assert.equal(changes,1);assert.match(w.document.querySelector('[data-vocabulary-notice]').textContent,/já existe/);
    const entry=[...w.document.querySelectorAll('.author-vocabulary-list li')].find(li=>li.querySelector('bdo')?.textContent==='A');
    entry.querySelector('button').click();form.elements.meaning.value='Sentido revisado';form.elements.partOfSpeech.value='verbo';submit();
    assert.equal(changes,2);assert.equal(data.peregrini.lexicon.find(x=>x.term==='A').meaning,'Sentido revisado');assert.equal(data.peregrini.lexicon.find(x=>x.term==='A').partOfSpeech,'verbo');
    w.document.querySelector('[data-vocabulary-search]').value='Sentido revisado';w.document.querySelector('[data-vocabulary-search]').dispatchEvent(new w.Event('input'));
    assert.equal(w.document.querySelectorAll('.author-vocabulary-list li').length,1);
    w.document.querySelector('.author-vocabulary-list .danger').click();assert.equal(changes,3);
    assert(!data.peregrini.lexicon.some(x=>x.term==='A'));
  }finally{dom.window.close();}
});

test('O build publica os arquivos WOFF2 da coleção atual, não os da pasta legada',()=>{
  for(const family of ['Texto','Display','Iluminada']){
    const file=`PalavraPeregrini${family}-Regular.woff2`;
    assert(fs.readFileSync(path.join(root,'dist/fonts',file)).equals(fs.readFileSync(path.join(root,'fontes/woff2',file))));
  }
});
