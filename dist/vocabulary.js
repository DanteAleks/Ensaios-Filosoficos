(() => {
  'use strict';
  const root=document.querySelector('[data-vocabulary]'),P=window.PeregriniLanguage;
  if(!root||!P)return;
  const list=root.querySelector('.peregrini-lexicon');
  const entries=[...list.querySelectorAll('[data-vocabulary-entry]')].map(node=>({...node.dataset,partOfSpeech:node.dataset.partOfSpeech,node}));
  const query=root.querySelector('#vocabulary-query'),order=root.querySelector('#vocabulary-order'),letter=root.querySelector('#vocabulary-letter');
  function update(){
    const filtered=P.filterLexicon(entries,{query:query.value,order:order.value,letter:letter.value});
    const visible=new Set(filtered);
    entries.forEach(entry=>{entry.node.hidden=!visible.has(entry);});
    filtered.forEach(entry=>list.append(entry.node));
    root.querySelector('#vocabulary-count').textContent=filtered.length+' de '+entries.length+' '+(entries.length===1?'palavra':'palavras');
    root.querySelector('[data-vocabulary-empty]').hidden=filtered.length>0;
  }
  root.querySelector('[data-vocabulary-controls]').hidden=false;
  query.addEventListener('input',update);order.addEventListener('change',update);letter.addEventListener('change',update);
  update();
})();
