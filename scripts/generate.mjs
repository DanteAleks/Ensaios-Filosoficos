import fs from 'node:fs';
import D from '../dist/document.js';
import M from '../dist/admin/model.js';
import { createHash } from 'node:crypto';
import { parseCatalog } from './read-catalog.mjs';
import { copyFonts } from './copy-fonts.mjs';
import { writePeregriniPages } from './peregrini-pages.mjs';
import P from '../dist/peregrini-language.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const assetVersion='15';
const source=fs.readFileSync(path.join(root,'content/obras.json'),'utf8');
const data=M.validate(parseCatalog(source));
const languagePage=JSON.parse(fs.readFileSync(path.join(root,'content/peregrini.json'),'utf8'));
function ensure(ok,message){if(!ok)throw Error(message);}
ensure(languagePage&&typeof languagePage.notice==='string'&&typeof languagePage.proceed==='string','Configuração da área Peregrini inválida');
copyFonts(root);

const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const formats={sintetico:'Sintético',didatico:'Didático'};
const statuses={andamento:'Em andamento',finalizado:'Finalizado'};
const availability={integral:'Texto integral',trecho:'Trecho',demonstracao:'Demonstração'};
const date=d=>d?d.split('-').reverse().join('/'):'Não informada';
const slug=s=>typeof s==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(s);
ensure(typeof data.author==='string'&&Array.isArray(data.works),'Autor ou lista de obras inválidos');
const ids=new Set();
for(const w of data.works){
  ensure(slug(w.id)&&!ids.has(w.id),'ID de obra inválido ou repetido: '+w.id);ids.add(w.id);
  ensure(typeof w.title==='string'&&w.title.trim()&&typeof w.summary==='string'&&typeof w.kind==='string','Título, tipo ou resumo inválido: '+w.id);
  ensure(Array.isArray(w.variants)&&w.variants.length,'Inclua uma versão: '+w.id);
  const vs=new Set();
  for(const v of w.variants){
    ensure(formats[v.id]&&!vs.has(v.id),'Forma inválida ou repetida: '+w.id);vs.add(v.id);
    ensure(statuses[v.status]&&availability[v.availability],'Estado ou disponibilidade inválidos: '+w.id);
    ensure(v.updated===null||(/^\d{4}-\d{2}-\d{2}$/.test(v.updated)&&!isNaN(Date.parse(v.updated))&&new Date(v.updated).toISOString().slice(0,10)===v.updated),'Data inválida: '+w.id);
    ensure(Array.isArray(v.chapters)&&v.chapters.length,'Inclua capítulos: '+w.id);
    const sections=new Set();
    function validate(nodes,depth=0){
      if(!nodes.length)return;
      ensure(depth<=1,'Use capítulos e um nível de subcapítulos');
      for(const c of nodes){
        ensure(slug(c.id)&&!sections.has(c.id),'ID de capítulo inválido ou repetido: '+c.id);sections.add(c.id);
        ensure(typeof c.title==='string'&&c.title.trim()&&Array.isArray(c.paragraphs)&&c.paragraphs.every(p=>typeof p==='string'),'Capítulo inválido: '+c.id);
        if(c.subchapters){ensure(Array.isArray(c.subchapters),'Subcapítulos inválidos');validate(c.subchapters,depth+1);}
      }
    }
    validate(v.chapters);
  }
}

const href=(w,v,prefix='./')=>`${prefix}obras/${w.id}/${v.id}.html`;
function metadata(v){return `<dl class="work-metadata"><div><dt>Estado</dt><dd>${statuses[v.status]}</dd></div><div><dt>Apresentação</dt><dd>${formats[v.id]}</dd></div><div><dt>Disponível</dt><dd>${availability[v.availability]}</dd></div><div><dt>Última atualização</dt><dd>${date(v.updated)}</dd></div></dl>`;}
function progress(v){return v.status==='andamento'?`<div class="next-grid"><div><small>Última parte escrita</small><strong>${E(v.last||'Não informada')}</strong></div><div><small>Próxima parte</small><strong>${E(v.next||'A definir')}</strong></div></div>`:'';}
const isPeregrini=w=>w.language==='peregrini';
const siteWorks=()=>data.works.filter(w=>!isPeregrini(w));
const peregriniWorks=()=>data.works.filter(isPeregrini);
const workHref=(w,v,prefix='./')=>isPeregrini(w)?`${prefix}peregrini/obras/${w.id}/${v.id}.html`:href(w,v,prefix);
function card(w,v){return `<article class="work-card" data-order="${data.works.indexOf(w)}" data-date="${E(w.published||'')}" data-status="${v.status}" data-format="${v.id}"><div class="card-topline"><span>${E(w.kind)}</span><span class="format-badge">${formats[v.id]}</span></div><div class="card-body">${w.published?`<p class="publication-date">Publicado em ${date(w.published)}</p>`:''}<h3><a href="${workHref(w,v)}">${E(w.title)}</a></h3><p>${E(w.summary)}</p><div class="card-state"><span>${statuses[v.status]}</span><span>${availability[v.availability]}</span></div>${v.availability==='demonstracao'?'<p class="sample-label">Exemplo fictício para demonstração.</p>':''}</div><a class="card-action" href="${workHref(w,v)}" aria-label="Ler ${E(w.title)}, versão ${formats[v.id]}">Abrir leitura <span aria-hidden="true">↗</span></a></article>`;}
function toc(nodes){return `<ol>${nodes.map(c=>`<li><a href="#${c.id}">${E(c.title)}</a>${c.subchapters?.length?toc(c.subchapters):''}</li>`).join('')}</ol>`;}
function section(c,level=2){return `<section class="chapter" id="${c.id}" tabindex="-1"><h${level}>${E(c.title)}</h${level}>${c.paragraphs.map(p=>`<p>${E(p)}</p>`).join('')}${(c.subchapters||[]).map(s=>section(s,level+1)).join('')}</section>`;}
function messageForm(w,v){
  const email='viaperegriniluminus@hotmail.com';
  const url=`https://dantealeks.github.io/Ensaios-Filosoficos/obras/${w.id}/${v.id}.html`;
  const subject=`Dúvida sobre ${w.title} — ${formats[v.id]}`;
  const body=`Olá, Aleks!\n\nGostaria de conversar sobre o texto “${w.title}” (${formats[v.id]}).\n${url}\n\nMinha dúvida ou observação:\n`;
  const mailto=`mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
  return `<section class="reader-contact author-message" data-author-message="${w.id}/${v.id}" aria-labelledby="message-title"><h2 id="message-title">Mensagem para o autor</h2><div class="contact-actions"><a class="contact-email" href="${E(mailto)}">Enviar uma dúvida por e-mail ↗</a><button type="button" data-copy-email="${email}">Copiar endereço</button></div><p class="contact-status" role="status" aria-live="polite"></p><details class="private-message-details"><summary><span>Mensagem privada pelo site</span><small>Somente o autor poderá ler sua mensagem.</small></summary><div class="private-message-body"><p class="contact-help">Preencha seus dados para que o autor possa responder.</p><form class="private-message-form"><fieldset><label for="message-name">Nome <span>(opcional)</span><input id="message-name" name="name" autocomplete="name" maxlength="100"></label><label for="message-email">E-mail para resposta<input id="message-email" name="email" type="email" autocomplete="email" maxlength="254" required></label><label for="message-body">Sua pergunta ou observação<textarea id="message-body" name="message" rows="6" minlength="10" maxlength="4000" required></textarea></label><button type="submit">Enviar mensagem</button></fieldset></form><p data-message-status role="status" aria-live="polite"></p></div></details></section>`;
}
function reactions(w,v){return `<section class="reader-reactions" data-reactions-work="${w.id}/${v.id}" aria-labelledby="reactions-title"><h2 id="reactions-title">O que achou deste texto?</h2><div class="reaction-buttons"><button type="button" data-vote="like" aria-label="Gostei" title="Gostei" aria-pressed="false" disabled><span aria-hidden="true">♡</span><span data-like-count aria-label="Corações"></span></button><button type="button" data-vote="dislike" aria-label="Não gostei" title="Não gostei" aria-pressed="false" disabled><span aria-hidden="true">👎</span></button></div><p role="status" aria-live="polite">Carregando avaliações…</p><noscript>Ative JavaScript para avaliar este texto.</noscript></section>`;}

function page(w,v){
  const peregrini=isPeregrini(w),rootPrefix=peregrini?'../../../':'../../';
  const hrefHome='../../index.html',lang=peregrini?'art-x-peregrini':'pt-BR';
  const textClass=peregrini?'peregrini-document':'reading-text';
  const readingFont='<option value="peregrini-text">Palavra Peregrini · Texto</option><option value="peregrini-display">Palavra Peregrini · Display</option><option value="peregrini-iluminada">Palavra Peregrini · Iluminada</option>';
  const workMarkup=v.blocks?D.render(v.blocks):v.chapters.map(c=>section(c)).join('');
  return `<!doctype html><html lang="${lang}" data-theme="luz" data-reading-language="${peregrini?'peregrini':'pt-BR'}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${E(w.title)} · ${formats[v.id]} — ${peregrini?'Área Peregrini':'Arquivo Peregrini'}</title><meta name="description" content="${E(w.summary)}"><link rel="icon" href="${rootPrefix}favicon.svg" type="image/svg+xml"><link rel="stylesheet" href="${rootPrefix}fonts.css?v=${assetVersion}"><link rel="stylesheet" href="${rootPrefix}styles.css?v=${assetVersion}"><script src="${rootPrefix}preferences.js?v=${assetVersion}"></script></head><body class="reading-page ${peregrini?'peregrini-reading':''}"><a class="skip-link" href="#texto">Ir para o texto</a><header class="reading-header"><a class="brand" href="${hrefHome}"><span class="brand-mark" aria-hidden="true">Ж</span><span>${peregrini?'Área Peregrini':'Voltar ao acervo'}</span></a><a href="#sumario">Sumário</a></header><div class="reading-layout"><aside class="reading-sidebar"><div id="resume-reading" class="resume-reading" hidden><button type="button">Retomar leitura</button><small>Posição salva neste navegador.</small></div><details open id="sumario"><summary>Sumário da obra</summary><nav aria-label="Capítulos e subcapítulos">${toc(v.chapters)}</nav></details><details class="reading-settings" open><summary>Aparência da leitura</summary><label for="reading-size">Tamanho da letra <output id="size-value" for="reading-size">100%</output></label><input id="reading-size" type="range" min="80" max="160" step="10" value="100"><label for="reading-font">Fonte</label><select id="reading-font"><option value="classica">Clássica · Georgia</option><option value="livro">Livro · Palatino</option>${readingFont}<option value="simples">Simples · Arial</option></select><label for="reading-theme">Tema</label><select id="reading-theme"><option value="luz">Claro</option><option value="noite">Escuro</option></select><button id="reset-reading" type="button">Restaurar aparência</button></details><button id="print-reading" type="button">Imprimir / salvar como PDF</button><p class="print-help">Na janela de impressão, escolha “Salvar como PDF”.</p></aside><main id="texto" class="${textClass}" ${peregrini?'data-study="rtl"':''}><header class="work-heading"><p class="eyebrow">${E(w.kind)} · ${formats[v.id]}</p><h1 class="${peregrini?'peregrini-script':''}">${E(w.title)}</h1><p class="byline">${E(data.author)}</p><p class="${peregrini?'ltr-fragment':''}" dir="ltr">${E(w.summary)}</p>${metadata(v)}${peregrini?'':(w.collections||[]).map(c=>`<a class="collection-link" href="../../index.html#colecao-${collectionID(c)}">${E(c)}</a>`).join(' ')}${v.availability==='demonstracao'?'<p class="demo-notice">Exemplo fictício para demonstração.</p>':v.availability==='trecho'?'<p class="demo-notice">Trechos de apresentação. O texto integral ainda não está disponível nesta página.</p>':''}${progress(v)}${w.variants.length>1?`<nav class="version-links" aria-label="Versões da obra"><span>Forma de leitura:</span>${w.variants.map(o=>`<a href="./${o.id}.html" ${o.id===v.id?'aria-current="page"':''}>${formats[o.id]} · ${statuses[o.id]}</a>`).join('')}</nav>`:''}</header>${workMarkup}${peregrini?'':reactions(w,v)}${peregrini?'':messageForm(w,v)}</main></div><script src="${rootPrefix}reader.js?v=${assetVersion}"></script><script src="${rootPrefix}reading-memory.js?v=${assetVersion}"></script>${peregrini?'<script src="'+rootPrefix+'peregrini-language.js?v='+assetVersion+'"></script>':''}${peregrini?'':'<script src="'+rootPrefix+'contact.js?v='+assetVersion+'"></script><script src="'+rootPrefix+'reactions-config.js?v='+assetVersion+'"></script><script src="'+rootPrefix+'reactions.js?v='+assetVersion+'"></script><script src="'+rootPrefix+'messages.js?v='+assetVersion+'"></script>'}</body></html>`;
}

// Valida o catálogo inteiro antes de substituir qualquer página gerada.
const target=path.join(root,'dist/obras');fs.mkdirSync(target,{recursive:true});
const peregriniTarget=path.join(root,'dist/peregrini/obras');fs.mkdirSync(peregriniTarget,{recursive:true});
const expected=new Set();
for(const w of data.works){
  const base=isPeregrini(w)?peregriniTarget:target;
  fs.mkdirSync(path.join(base,w.id),{recursive:true});
  for(const v of w.variants){
    const file=path.join(base,w.id,`${v.id}.html`);expected.add(file);
    fs.writeFileSync(file,page(w,v));
  }
}
for(const dir of fs.readdirSync(target,{withFileTypes:true}))if(dir.isDirectory())for(const name of fs.readdirSync(path.join(target,dir.name))){const f=path.join(target,dir.name,name);if(name.endsWith('.html')&&!expected.has(f))fs.unlinkSync(f);}
for(const dir of fs.readdirSync(peregriniTarget,{withFileTypes:true}))if(dir.isDirectory())for(const name of fs.readdirSync(path.join(peregriniTarget,dir.name))){const f=path.join(peregriniTarget,dir.name,name);if(name.endsWith('.html')&&!expected.has(f))fs.unlinkSync(f);}

const collectionNames=[...new Set(siteWorks().flatMap(w=>w.collections||[]))];
function collectionID(name){return 'c-'+Buffer.from(name).toString('hex');}
function ordered(works){return works;}
function markedCards(works){
  const dated=works.filter(w=>w.published).sort((a,b)=>b.published.localeCompare(a.published));
  const newest=dated[0]?.published;
  return ordered(works).flatMap(w=>w.variants.map(v=>card(w,v).replace('<div class="card-body">','<div class="card-body">'+(newest&&w.published===newest?'<span class="newest-badge">Mais novo</span>':'')))).join('\n');
}
const controls=targetID=>`<label class="catalog-order">Organizar por <select data-sort="${targetID}"><option value="author">Ordem de leitura do autor</option><option value="newest">Publicação: mais recentes</option><option value="oldest">Publicação: mais antigos</option></select></label>`;
const cards=kind=>markedCards(siteWorks().filter(w=>(w.kind.trim().toLowerCase()==='suma')===kind));
const publicationOrder=(a,b)=>(b.published||'').localeCompare(a.published||'')||data.works.indexOf(a)-data.works.indexOf(b);
const collections='<div class="collection-directory">'+collectionNames.map(name=>{const id=collectionID(name),works=siteWorks().filter(w=>w.collections?.includes(name)),newest=[...works].filter(w=>w.published).sort(publicationOrder)[0];return `<details class="collection-section" id="colecao-${id}"><summary><span class="collection-emblem" aria-hidden="true">❦</span><span class="collection-name">${E(name)}</span><span class="collection-count">${works.length} ${works.length===1?'texto':'textos'}</span><span class="collection-latest">${newest?`Mais novo: <strong>${E(newest.title)}</strong><time datetime="${newest.published}">${date(newest.published)}</time>`:'Data de publicação ainda não informada'}</span><span class="collection-invitation">Explorar coleção <span aria-hidden="true">＋</span></span></summary><div class="collection-content">${controls(id)}<div class="work-grid" id="${id}">${markedCards(works)}</div></div></details>`;}).join('')+'</div>';
const recent=siteWorks().filter(w=>w.published).sort(publicationOrder).slice(0,6);
const updates=recent.length?'<ol class="recent-publications">'+recent.map(w=>`<li><span class="recent-kind">${E(w.kind)}</span><time datetime="${w.published}">${date(w.published)}</time><h3><a href="${href(w,w.variants[0])}">${E(w.title)}</a></h3><p>${E(w.summary)}</p>${w.variants.length>1?`<div class="recent-versions">${w.variants.map(v=>`<a href="${href(w,v)}">${formats[v.id]}</a>`).join(' · ')}</div>`:''}</li>`).join('')+'</ol>':'<p class="recent-empty">As próximas publicações serão reunidas aqui.</p>';
const language=P.settings(data.peregrini);
const peregriniCards=peregriniWorks().length?`<div class="peregrini-work-grid">${markedCards(peregriniWorks()).replaceAll('./peregrini/','./')}</div>`:`<p class="peregrini-empty">${E(languagePage.emptyText)}</p>`;
writePeregriniPages({root,assetVersion,config:languagePage,language,cards:peregriniCards});

let home=fs.readFileSync(path.join(root,'templates/home.html'),'utf8').replace('{{PEREGRINI_NAME}}',E(languagePage.label)).replace('{{PEREGRINI_ENTRY_WORD}}',E(language.entryWord||language.word)).replace('{{PEREGRINI_WORD}}',E(language.word)).replace('{{UPDATES}}',updates).replace('{{WORKS}}',cards(false)).replace('{{SUMAS}}',cards(true)).replace('{{COLLECTIONS}}',collectionNames.length?collections:'<p>As coleções serão reunidas aqui conforme o acervo crescer.</p>').replace('{{ORDER_WORKS}}',controls('work-grid')).replace('{{ORDER_SUMAS}}',controls('sumas-grid'));
fs.writeFileSync(path.join(root,'dist/index.html'),home);
console.log(`Acervo gerado: ${data.works.length} obras, ${expected.size} páginas de leitura.`);
fs.writeFileSync(path.join(root,'dist/publication.json'),JSON.stringify({catalogHash:createHash('sha256').update(source).digest('hex'),builtAt:new Date().toISOString()}));
fs.writeFileSync(path.join(root,'dist/reactions-manifest.json'),JSON.stringify(data.works.flatMap(w=>w.variants.map(v=>({id:w.id+'/'+v.id,title:w.title,format:formats[v.id]})))));
