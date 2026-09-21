import fs from 'node:fs';
import path from 'node:path';
import C from '../dist/peregrini-codification.js';
import P from '../dist/peregrini-language.js';

const version=17;
const E=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const encoded=value=>C.parts(C.encode(value)).map(part=>part.protected?`<bdi class="pg-ltr" dir="ltr">${E(part.text)}</bdi>`:E(part.text)).join('');
// Publish the actual writing, rather than waiting for JavaScript to translate a
// Portuguese page. The marker prevents the browser from encoding it a second time.
const text=(tag,value,className='',attrs='')=>`<${tag} class="pg-rtl ${className}" data-peregrini-encoded ${attrs}>${encoded(value)}</${tag}>`;
const official=value=>`<bdo class="pg-official" lang="art-x-peregrini" dir="rtl" data-peregrini-encoded>${E(value)}</bdo>`;
const flourish='<img class="pg-flourish" src="../peregrini-flourish.svg" alt="" aria-hidden="true" width="640" height="100">';

function navigation(current){
  const links=current==='via'?[['../index.html','Voltar ao início']]:[
    ['./index.html','Escritos'],['./idioma.html','Alfabeto'],['./idioma.html#vocabulario','Vocabulário'],['../index.html','Arquivo geral']
  ];
  return links.map(([href,label])=>text('a',label,'',`href="${href}"${href===`./${current}.html`?' aria-current="page"':''}`)).join('');
}
function header(current){
  return `<a class="skip-link pg-rtl" data-peregrini-encoded href="#conteudo">${encoded('Ir para o conteúdo')}</a>
<header class="site-header"><a class="brand" href="../index.html"><span class="brand-mark" aria-hidden="true">Ж</span><span class="brand-copy">${text('strong','Via Peregrini Luminus')}${text('small',current==='via'?'Informação prévia':'Área Peregrini')}</span></a>
<nav class="desktop-nav" aria-label="Navegação da área Peregrini">${navigation(current)}</nav>
<div class="header-actions"><button class="icon-button" id="theme-toggle" type="button" aria-label="Alternar tema"><span aria-hidden="true">◐</span></button>${text('button','Menu','menu-button','id="menu-button" type="button" aria-expanded="false" aria-controls="mobile-nav"')}</div></header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Navegação móvel" hidden>${navigation(current)}</nav>`;
}
function footer(){
  return `<footer><a class="brand footer-brand" href="../index.html"><span class="brand-mark" aria-hidden="true">Ж</span><span class="brand-copy">${text('strong','Via Peregrini Luminus')}${text('small','Escritos e contemplação')}</span></a>${text('a','Voltar ao início ↑','back-top','href="#inicio"')}</footer>`;
}
function page(current,title,body,extraScripts=''){
  return `<!doctype html>
<html lang="art-x-peregrini" data-theme="luz" data-peregrini-codification="portuguese" data-peregrini-layout="logical-rtl"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${E(title)} · Via Peregrini Luminus</title>
<meta name="description" content="Escritos, alfabeto e leitura da Via Peregrini Luminus.">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../fonts.css?v=${version}"><link rel="stylesheet" href="../styles.css?v=${version}">
<link id="peregrini-codification-style" rel="stylesheet" href="../peregrini-codification.css?v=${version}">
<script src="../preferences.js?v=${version}"></script><script src="../peregrini-codification.js?v=${version}" defer></script></head>
<body class="peregrini-portal pg-page pg-${current}" id="inicio">
${header(current)}<main id="conteudo">${body}</main>${footer()}
<script src="../app.js?v=${version}"></script>${extraScripts}</body></html>`;
}

function gateway(config){
  return `<div class="pg-gateway-shell">
<section class="peregrini-portal-hero" aria-labelledby="via-title">
<div class="pg-intro"><div class="peregrini-wordmark">${official('Cлovo Пereгrиhи')}</div>
${text('p','Informação prévia','eyebrow')}
${text('h1',config.portalTitle,'peregrini-script','id="via-title"')}
${flourish}${text('p',config.notice,'lead gateway-notice')}
${text('a',config.proceed,'primary-button','href="./index.html"')}
</div>
<figure class="pg-frontispiece" aria-hidden="true"><img src="../pilgrim.png" alt="" width="1024" height="1536" fetchpriority="high"></figure>
</section><div class="pg-gateway-signature" aria-hidden="true"><span></span><b>Ж</b><span></span></div></div>`;
}
function workCard(work,variant){
  const href=`./obras/${E(work.id)}/${E(variant.id)}.html`;
  return `<article class="work-card" data-order="${E(work.order)}"><div class="card-topline">${text('span',work.kind)}${text('span',variant.id==='didatico'?'Didático':'Sintético','format-badge')}</div>
<div class="card-body"><h3 class="pg-rtl">${text('a',work.title,'',`href="${href}"`)}</h3>${text('p',work.summary)}<div class="card-state">${text('span',variant.status==='finalizado'?'Finalizado':'Em andamento')}${text('span',variant.availability==='integral'?'Texto integral':variant.availability==='demonstracao'?'Demonstração':'Trecho')}</div></div>
${text('a','Abrir leitura','card-action',`href="${href}" aria-label="${E('Ler '+work.title)}"`)}</article>`;
}
function archive(config,works){
  const cards=works.flatMap((work,order)=>work.variants.map(variant=>workCard({...work,order},variant))).join('\n');
  return `<section class="pg-area-hero" aria-labelledby="area-title"><div class="peregrini-wordmark">${official('Cлovo Пereгrиhи')}</div>${text('p','A escrita da Via','eyebrow')}${text('h1','Escritos em Peregrini','','id="area-title"')}${text('p','Textos originais, reflexões e estudos reunidos na escrita Peregrini.','lead')}${flourish}</section>
<section class="peregrini-works" id="escritos-peregrini" aria-labelledby="works-title">${text('h2','Os escritos','','id="works-title"')}${cards?`<div class="peregrini-work-grid">${cards}</div>`:text('p',config.emptyText,'peregrini-empty')}</section>
<section class="pg-language-invitation" id="idioma" aria-labelledby="language-door-title"><div class="pg-letter-art" aria-hidden="true">A И<br>Я Ю</div><div>${text('p','O idioma Peregrini','eyebrow')}${text('h2','Letras e leitura','','id="language-door-title"')}${text('p','Conheça as letras, os sons, as combinações vocálicas e as palavras da Via.')}${text('a','Conhecer o alfabeto','language-door','href="./idioma.html"')}</div></section>`;
}

// References to Portuguese pronunciation are quoted exactly from the supplied
// document. Encoding those examples would change the sounds being taught.
const reference=value=>`<span lang="pt-BR" dir="ltr" data-no-peregrini-codification>${E(value)}</span>`;
function alphabetTable(alphabet){
  const rows=alphabet.letters.map(letter=>`<tr id="letra-${letter.number}">
<td>${reference(letter.number)}</td><th scope="row" class="peregrini-glyph">${reference(letter.upper)}</th><td><code>${E(letter.upperCode)}</code></td>
<td class="peregrini-glyph">${reference(letter.lower)}</td><td><code>${E(letter.lowerCode)}</code></td><td data-label="Cursiva">${reference(letter.cursive)}</td>
<td class="pg-pronunciation" data-label="Pronúncia aproximada">${reference(letter.pronunciation)}</td><td class="pg-examples" data-label="Combinações e exemplos"><ul class="vowel-word-examples" lang="pt-BR" dir="ltr" data-no-peregrini-codification>${letter.examples.split(' · ').map(example=>`<li>${E(example)}</li>`).join('')}</ul></td></tr>`).join('\n');
  return `<div class="language-table-wrap pg-alphabet-table" tabindex="0" role="region" aria-label="Alfabeto oficial; use a rolagem horizontal para consultar todas as colunas"><table id="alphabet-table">
${text('caption','Alfabeto Peregrini · 28 letras')}
<thead><tr>${alphabet.headers.map(heading=>text('th',heading,'','scope="col"')).join('')}</tr></thead><tbody>${rows}</tbody></table></div>`;
}
function referenceTable(data,title){
  return `<div class="language-table-wrap pg-reference-table" tabindex="0" role="region" aria-label="${E(title)}"><table lang="pt-BR" dir="ltr" data-no-peregrini-codification><caption>${E(title)}</caption><thead><tr>${data.headers.map(heading=>`<th scope="col">${E(heading)}</th>`).join('')}</tr></thead><tbody>${data.rows.map(row=>`<tr>${row.map((value,i)=>`<${i===0?'th scope="row"':'td'}>${E(value)}</${i===0?'th':'td'}>`).join('')}</tr>`).join('')}</tbody></table></div>`;
}
function rules(items){return `<ul class="pg-reference-rules" lang="pt-BR" dir="ltr" data-no-peregrini-codification>${items.map(value=>`<li>${E(value)}</li>`).join('')}</ul>`;}
function vocabulary(settings){
  const entries=P.filterLexicon(settings.lexicon);
  const letters=P.alphabet.filter(letter=>entries.some(entry=>P.normalize(entry.term).startsWith(letter.upper)));
  const items=entries.map(entry=>`<li data-vocabulary-entry data-term="${E(entry.term)}" data-meaning="${E(entry.meaning)}" data-pronunciation="${E(entry.pronunciation||'')}" data-example="${E(entry.example||'')}" data-part-of-speech="${E(entry.partOfSpeech||'')}"><h3>${official(entry.term)}</h3>${text('p',entry.meaning)}${entry.pronunciation?`<p class="pg-pronunciation">${reference(entry.pronunciation)}</p>`:''}${entry.example?`<p>${official(entry.example)}</p>`:''}${entry.partOfSpeech?text('p',P.partOfSpeechLabels[entry.partOfSpeech],'vocabulary-grammar'):''}</li>`).join('');
  return `<section id="vocabulario" class="pg-vocabulary" data-vocabulary aria-labelledby="vocabulary-title">${text('p','Palavras da Via','eyebrow')}${text('h2','Vocabulário','','id="vocabulary-title"')}
<div class="vocabulary-controls" data-vocabulary-controls hidden><div>${text('label','Pesquisar no vocabulário','','for="vocabulary-query"')}<input id="vocabulary-query" type="search" aria-label="Pesquisar palavra, significado ou pronúncia" autocomplete="off"></div><div>${text('label','Ordenar','','for="vocabulary-order"')}<select id="vocabulary-order"><option value="alphabet">Ordem alfabética Peregrini</option><option value="reverse">Ordem alfabética inversa</option></select></div><div>${text('label','Letra inicial','','for="vocabulary-letter"')}<select id="vocabulary-letter"><option value="">Todas as letras</option>${letters.map(letter=>`<option value="${E(letter.upper)}" data-no-peregrini-codification>${E(letter.upper)}</option>`).join('')}</select></div></div>
<p id="vocabulary-count" role="status" aria-live="polite">${entries.length} palavras</p><ul class="peregrini-lexicon">${items}</ul>${text('p','Nenhuma palavra encontrada.','','data-vocabulary-empty hidden')}</section>`;
}
function language(alphabet,settings){
  return `<section class="pg-area-hero pg-language-hero" aria-labelledby="language-title">${text('p','O idioma Peregrini','eyebrow')}${text('h1','Letras e leitura','','id="language-title"')}${text('p','O alfabeto, os sons e as palavras da Via.','lead')}${flourish}<nav class="pg-section-nav" aria-label="Seções do idioma">${[['#alfabeto','Alfabeto'],['#nasalizacao','Nasalização'],['#regras','Regras de leitura'],['#vocabulario','Vocabulário']].map(([href,label])=>text('a',label,'',`href="${href}"`)).join('')}</nav></section>
<section class="peregrini-language" id="alfabeto" aria-labelledby="alphabet-title"><div class="section-heading"><div>${text('p','Norma oficial · versão 5','eyebrow')}${text('h2','Alfabeto Peregrini','','id="alphabet-title"')}</div>${text('p','Maiúsculas, minúsculas, códigos Unicode, pronúncia e exemplos do documento oficial de 24 de agosto de 2026.')}</div>
${alphabetTable(alphabet)}
<p class="pg-reference-note" lang="pt-BR" dir="ltr" data-no-peregrini-codification>Fonte: <cite>Alfabeto Peregrini Oficial</cite>, versão 5, 24 de agosto de 2026. Os exemplos de pronúncia conservam o português do documento. A forma cursiva permanece reservada.</p>
<section id="nasalizacao" class="pg-reference-section">${text('h2','Nasalização vocálica')}${referenceTable(alphabet.nasalization,'Nasalização vocálica')}${rules(alphabet.nasalization.note)}</section>
<section id="regras" class="pg-reference-section">${text('h2','Regras de leitura')}${rules(alphabet.readingRules)}<details class="pg-reference-details">${text('summary','Restrições fonotáticas')}${rules(alphabet.restrictions)}</details><details class="pg-reference-details">${text('summary','Transliteração latina de referência')}${referenceTable(alphabet.transliteration,'Transliteração latina de referência')}${rules(alphabet.transliteration.note)}</details><details class="pg-reference-details">${text('summary','Letras não produtivas e formas reservadas')}${referenceTable(alphabet.available,'Letras não produtivas / disponíveis')}${rules([alphabet.reserved])}</details></section>
${vocabulary(settings)}</section>`;
}

export function generatePeregriniPages(root,config,data){
  const alphabet=JSON.parse(fs.readFileSync(path.join(root,'content/peregrini-alphabet-v5.json'),'utf8'));
  const settings=P.settings(data.peregrini);
  const pages={
    'via.html':page('via',config.portalTitle,gateway(config)),
    'index.html':page('index','Escritos em Peregrini',archive(config,data.works.filter(P.isPeregrini))),
    'idioma.html':page('idioma','Letras e leitura',language(alphabet,settings),`<script src="../peregrini-language.js?v=${version}"></script><script src="../vocabulary.js?v=${version}"></script>`)
  };
  const destination=path.join(root,'dist/peregrini');fs.mkdirSync(destination,{recursive:true});
  for(const [name,html] of Object.entries(pages))fs.writeFileSync(path.join(destination,name),html);
}
