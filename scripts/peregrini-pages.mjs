import fs from 'node:fs';
import path from 'node:path';
import P from '../dist/peregrini-language.js';

const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const script=s=>`<bdo class="peregrini-glyph peregrini-rtl" lang="art-x-peregrini" dir="rtl">${E(s)}</bdo>`;

export function writePeregriniPages({root,assetVersion,config,language,cards}){
  const nav=`<a href="./index.html">Escritos em Peregrini</a><a href="./idioma.html">Letras e leitura</a><a href="../index.html">Arquivo geral</a>`;
  function page(title,body,{gateway=false,idioma=false}={}){
    return `<!doctype html>
<html lang="pt-BR" data-theme="luz"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>${E(title)} · Via Peregrini Luminus</title>
<meta name="description" content="${E(gateway?config.notice:idioma?config.languageLead:config.portalLead)}">
<link rel="icon" href="../favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="../fonts.css?v=${assetVersion}"><link rel="stylesheet" href="../styles.css?v=${assetVersion}">
<script src="../preferences.js?v=${assetVersion}"></script></head>
<body class="peregrini-portal${gateway?' peregrini-gateway':''}" id="inicio">
<a class="skip-link" href="#conteudo">Ir para o conteúdo</a>
<header class="site-header"><a class="brand" href="../index.html"><span class="brand-mark" aria-hidden="true">Ж</span><span class="brand-copy"><strong>Via Peregrini Luminus</strong><small>${gateway?'Informação prévia':'Área Peregrini'}</small></span></a>
<nav class="desktop-nav" aria-label="Navegação da área Peregrini">${gateway?'<a href="../index.html">Voltar ao início</a>':nav}</nav>
<div class="header-actions"><button class="icon-button" id="theme-toggle" type="button" aria-label="Alternar tema">◐</button><button class="menu-button" id="menu-button" type="button" aria-expanded="false" aria-controls="mobile-nav">Menu</button></div></header>
<nav class="mobile-nav" id="mobile-nav" aria-label="Navegação móvel" hidden>${gateway?'<a href="../index.html">Voltar ao início</a>':nav}</nav>
<main id="conteudo">${body}</main>
<footer><a class="brand footer-brand" href="../index.html"><span class="brand-mark" aria-hidden="true">Ж</span><span class="brand-copy"><strong>Via Peregrini Luminus</strong><small>${E(title)}</small></span></a><a class="back-top" href="#inicio">Voltar ao início ↑</a></footer>
<script src="../app.js?v=${assetVersion}"></script>${idioma?`<script src="../peregrini-language.js?v=${assetVersion}"></script><script src="../vocabulary.js?v=${assetVersion}"></script>`:''}</body></html>`;
  }
  const wordmark=`<div class="peregrini-wordmark">${script(language.word)}</div>`;
  const via=page('Antes de prosseguir',`
<section class="peregrini-gateway-card" aria-labelledby="via-title"><p class="eyebrow">Informação prévia</p>${wordmark}
<h1 id="via-title">A Via e seus escritos</h1><p class="gateway-notice">${E(config.notice)}</p>
<a class="primary-button" href="./index.html">Prosseguir Área Peregrini <span aria-hidden="true">↗</span></a></section>`,{gateway:true});

  const portal=page(config.portalTitle,`
<section class="peregrini-portal-hero"><p class="eyebrow">A palavra e o caminho</p>${wordmark}<h1>${E(config.portalTitle)}</h1>
<p class="lead">${E(config.portalLead)}</p><div class="portal-seal" aria-hidden="true">Ж</div></section>
<section id="escritos-peregrini" class="peregrini-works" aria-labelledby="works-peregrini-title"><div class="section-heading"><div><p class="eyebrow">Escritos originais</p><h2 id="works-peregrini-title">Escritos em Peregrini</h2></div><p>Um acervo que cresce com a escrita e a reflexão.</p></div>${cards}</section>
<section class="peregrini-language-invitation" aria-labelledby="invitation-title"><a class="language-door" href="./idioma.html"><span class="language-door-glyph" aria-hidden="true">Ж</span><span><span class="eyebrow">O idioma da Via</span><h2 id="invitation-title">Letras e leitura</h2><p>Conheça o alfabeto, consulte a pronúncia e encontre palavras no vocabulário.</p><span class="door-action">Abrir o guia do idioma <span aria-hidden="true">↗</span></span></span></a></section>`);

  const alphabet=P.alphabet.map(a=>`<tr><th scope="row">${script(a.upper)}</th><td>${script(a.lower)}</td><td>${E(a.sound)}<p class="phonetic-note">${E(a.note)}</p></td><td><ul class="vowel-word-examples">${a.examples.map(ex=>`<li>${script(ex.sample)}<span>${E(ex.reference)}</span></li>`).join('')}</ul></td></tr>`).join('');
  const entries=P.filterLexicon(language.lexicon);
  const lexicon=entries.map(entry=>`<li data-vocabulary-entry data-term="${E(entry.term)}" data-meaning="${E(entry.meaning)}" data-pronunciation="${E(entry.pronunciation||'')}" data-example="${E(entry.example||'')}" data-part-of-speech="${E(entry.partOfSpeech||'')}"><h3>${script(entry.term)}</h3><p>${E(entry.meaning)}</p>${entry.partOfSpeech&&P.partOfSpeechLabels[entry.partOfSpeech]?`<p class="vocabulary-grammar">${E(P.partOfSpeechLabels[entry.partOfSpeech])}</p>`:''}${entry.pronunciation?`<p class="vocabulary-pronunciation">Pronúncia: ${E(entry.pronunciation)}</p>`:''}${entry.example?`<p class="vocabulary-example">${script(entry.example)}</p>`:''}</li>`).join('');
  const letters=P.alphabet.filter(a=>entries.some(entry=>P.normalize(entry.term).startsWith(a.upper)));
  const idioma=page('Letras e leitura',`
<section class="peregrini-portal-hero language-hero"><p class="eyebrow">O idioma Peregrini</p><h1>Letras e leitura</h1><p class="lead">${E(config.languageLead)}</p><a class="portal-inline-link" href="#vocabulario">Consultar o vocabulário ↓</a></section>
<section class="peregrini-language" id="idioma" aria-labelledby="alphabet-title"><div class="section-heading"><div><p class="eyebrow">Os sinais da palavra</p><h2 id="alphabet-title">Alfabeto Peregrini</h2></div><p>Maiúsculas, minúsculas e palavras que ajudam a reconhecer os sons.</p></div>
<div class="language-table-wrap" role="region" tabindex="0" aria-label="Alfabeto e exemplos de pronúncia"><table><caption>Exemplos com vogais</caption><thead><tr><th scope="col">Maiúscula</th><th scope="col">Minúscula</th><th scope="col">Pronúncia</th><th scope="col">Exemplos com vogais · palavras de apoio</th></tr></thead><tbody>${alphabet}</tbody></table></div>
<p class="table-note">As palavras em português são aproximações sonoras, que podem variar com o sotaque. Nos exemplos com “+”, combine os sons das duas palavras; em Я e Ю, una “ia” e “iu”. Essas referências ajudam a ler as letras e não acrescentam palavras ao vocabulário.</p>
<div class="language-notes"><article><h3>Da direita para a esquerda</h3><p>A escrita Peregrini começa à direita. As explicações e as referências de pronúncia em português conservam sua direção habitual.</p></article><article><h3>Nasalização</h3><p>${script('N')} nasaliza a vogal anterior. A consoante de “navio” é ${script('H')}. Leia ${script('AN')} como uma vogal nasalizada.</p></article></div>
<section id="vocabulario" data-vocabulary aria-labelledby="vocabulary-title"><div class="section-heading"><div><p class="eyebrow">Palavras da Via</p><h2 id="vocabulary-title">Vocabulário</h2></div><p>Palavras, sentidos e usos do idioma Peregrini.</p></div>
<div class="vocabulary-controls" data-vocabulary-controls hidden><label for="vocabulary-query">Pesquisar no vocabulário<input id="vocabulary-query" type="search" placeholder="Palavra, significado ou pronúncia" autocomplete="off"></label><label for="vocabulary-order">Ordenar<select id="vocabulary-order"><option value="alphabet">Ordem alfabética Peregrini</option><option value="reverse">Ordem alfabética inversa</option></select></label><label for="vocabulary-letter">Letra inicial<select id="vocabulary-letter"><option value="">Todas as letras</option>${letters.map(a=>`<option value="${E(a.upper)}">${E(a.upper)} — ${E(a.sound)}</option>`).join('')}</select></label></div>
<p id="vocabulary-count" role="status" aria-live="polite">${entries.length} ${entries.length===1?'palavra':'palavras'}</p><ul class="peregrini-lexicon">${lexicon}</ul><p data-vocabulary-empty ${entries.length?'hidden':''}>Nenhuma palavra encontrada.</p></section></section>`,{idioma:true});

  const destination=path.join(root,'dist/peregrini');
  fs.mkdirSync(destination,{recursive:true});
  for(const [name,html] of Object.entries({'via.html':via,'index.html':portal,'idioma.html':idioma}))fs.writeFileSync(path.join(destination,name),html);
}
