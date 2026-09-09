const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const D=require('../dist/document.js');
const P=require('../dist/peregrini-language.js');
const root=path.resolve(__dirname,'..');

test('Editor comum insere fórmula LaTeX em linha e preserva o código',()=>{
  const dom=new JSDOM('<div id="host"></div>',{runScripts:'outside-only'}),w=dom.window;
  const version={blocks:[{tag:'p',runs:[{text:'Proposição: '}]}],chapters:[]};
  w.PeregriniDocument=D;w.prompt=()=>String.raw`\forall x\in A`;
  w.document.execCommand=(command,_ui,value)=>{
    if(command!=='insertText')return true;
    w.document.querySelector('.document-editor p').append(w.document.createTextNode(value));
    return true;
  };
  try{
    w.eval(fs.readFileSync(path.join(root,'dist/admin/rich-editor.js'),'utf8'));
    w.mountDocumentEditor(w.document.getElementById('host'),version,()=>{});
    w.document.querySelector('[data-latex-inline]').click();
    assert.equal(D.text(version.blocks[0]),String.raw`Proposição: \(\forall x\in A\)`);
    assert(w.document.querySelector('[data-latex-display]'));
  }finally{dom.window.close();}
});

test('Editor Peregrini insere fórmula destacada em LTR dentro do documento RTL',()=>{
  const dom=new JSDOM('<div id="host"></div>',{runScripts:'outside-only'}),w=dom.window;
  const version={direction:'rtl',blocks:[{tag:'p',direction:'rtl',runs:[{text:'Пereгrиhи '}]}],chapters:[]};
  w.PeregriniDocument=D;w.PeregriniLanguage=P;w.prompt=()=>String.raw`\sum_{n=1}^{\infty}\frac{1}{n^2}`;
  try{
    w.eval(fs.readFileSync(path.join(root,'dist/admin/peregrini-editor.js'),'utf8'));
    w.mountPeregriniEditor(w.document.getElementById('host'),version,()=>{});
    w.document.querySelector('[data-latex-display]').click();
    assert.match(D.text(version.blocks[0]),/\\\[\\sum_\{n=1\}\^\{\\infty\}\\frac\{1\}\{n\^2\}\\\]/);
    assert.equal(version.blocks[0].direction,'rtl');
    assert.equal(w.document.querySelector('.latex-source').dir,'ltr');
  }finally{dom.window.close();}
});

test('Renderizador matemático reconhece delimitadores e só tipografa o trecho solicitado',async()=>{
  const dom=new JSDOM('<main><p id="formula">A igualdade \\(x^2=1\\).</p><p id="prosa">Somente prosa.</p></main>',{runScripts:'outside-only'}),w=dom.window;
  let cleared,typeset;
  w.MathJax={typesetClear:nodes=>{cleared=nodes;},typesetPromise:async nodes=>{typeset=nodes;}};
  try{
    w.eval(fs.readFileSync(path.join(root,'dist/math-renderer.js'),'utf8'));
    assert.equal(w.PeregriniMath.contains(w.document.getElementById('formula')),true);
    assert.equal(w.PeregriniMath.contains(w.document.getElementById('prosa')),false);
    assert.equal(await w.PeregriniMath.typeset(w.document.querySelector('main')),true);
    assert.equal(cleared[0],w.document.querySelector('main'));
    assert.equal(typeset[0],w.document.querySelector('main'));
  }finally{dom.window.close();}
});

test('MathJax fica hospedado no próprio site com licença e carregamento preguiçoso',()=>{
  const bundle=path.join(root,'dist/vendor/mathjax/tex-svg-full.js');
  assert(fs.statSync(bundle).size>2000000);
  assert(fs.readFileSync(path.join(root,'dist/vendor/mathjax/LICENSE.txt'),'utf8').includes('Apache License'));
  const generator=fs.readFileSync(path.join(root,'scripts/generate.mjs'),'utf8');
  assert.match(generator,/math-renderer\.js/);
  assert.match(generator,/tex-svg-full\.js/);
});
