(function(root){
  'use strict';

  const exact=new Map([
    ['Informação prévia','яverп ynaсampoφnИ'],
    ['A Via e seus escritos','cytиrkcи cyec и aиV A'],
    ['Esta área reúne escritos originais sobre a Via Peregrini Luminus como uma religião de orientação monoteísta, segundo minha visão pessoal. Ela encontra afinidades, em alguns aspectos, com Maimônides, Hasdai Crescas, Joseph Albo e Ibn Taymiyyah. A Via possui idioma próprio: o Peregrini.','.иhиrгereП y :yиrпorп amoижди иyзoп aиV A .яиmиaT hbИ и ybyA φeзoЖ ,cakcerK иaдзA ,cиждиhomиaM nok ,cytkeпca cnyглa ne ,cиждадиhиφa artnokne aлE .yaoceп ynaзиv aњиm ydnyгec ,atcиetohom ynaсatneиro ижд ynяжилep amy ymok cyhиmyЛ иhиrгereП aиV a erboc cиahижиro cytиrkcи иhyep aera atcE'],
    ['Prosseguir Área Peregrini','иhиrгereП aerA piгecorП']
  ]);

  const vowels='aeiouáàâãéêíóôõúü';
  const isVowel=c=>!!c&&vowels.includes(c.toLowerCase());
  const upper=(source,value)=>source===source.toUpperCase()?value.toUpperCase():value;
  const reserved=new Set(['SVXED','ORIT','ORITVOR','PARISTOR']);
  const segmenter=typeof Intl!=='undefined'&&Intl.Segmenter?new Intl.Segmenter('pt',{granularity:'grapheme'}):null;
  const reverse=text=>(segmenter?Array.from(segmenter.segment(text),part=>part.segment):Array.from(text)).reverse().join('');
  // The user's samples are visual RTL strings. Recover logical reading order
  // ONCE. CSS, not string reversal, then composes each wrapped line right-to-left.
  const logicalExamples=new Map([...exact].map(([source,visual])=>[source,reverse(visual)]));
  const visualExamples=new Map([...exact.values()].map(visual=>[visual,reverse(visual)]));
  // Keep the same spelling when an approved sentence contains <strong> or links.
  const approvedWords=new Map();
  for(const [source,logical] of logicalExamples){
    const from=source.match(/[\p{L}\p{M}]+/gu)||[],to=logical.match(/[\p{L}\p{M}]+/gu)||[];
    if(from.length===to.length)from.forEach((word,i)=>approvedWords.set(word.toLowerCase(),to[i].toLowerCase()));
  }
  const protectedPattern=/(https?:\/\/[^\s<>]+|www\.[^\s<>]+|[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}|\\\([\s\S]*?\\\)|\\\[[\s\S]*?\\\]|\$\$[\s\S]*?\$\$|\$[^$\n]+\$|\d+(?:[.,:/–-]\d+)*(?:\s?%)?|\/[\p{L}\p{M}͡.]+\/)/gu;

  function parts(text){
    const out=[];let start=0;
    for(const match of text.matchAll(protectedPattern)){
      if(match.index>start)out.push({text:text.slice(start,match.index),protected:false});
      out.push({text:match[0],protected:true});start=match.index+match[0].length;
    }
    if(start<text.length)out.push({text:text.slice(start),protected:false});
    return out;
  }

  function word(input){
    // Mixed-script Peregrini terms and reserved names must not be encoded twice.
    if(reserved.has(input)||/[\u0370-\u03ff\u0400-\u04ff]/u.test(input))return input;
    const approved=approvedWords.get(input.toLowerCase());
    if(approved){
      if(input===input.toUpperCase())return approved.toUpperCase();
      return input[0]===input[0].toUpperCase()?approved[0].toUpperCase()+approved.slice(1):approved;
    }
    if(input==='Via')return 'Vиa';
    let out='';
    for(let i=0;i<input.length;i++){
      const ch=input[i], low=ch.toLowerCase(), next=(input[i+1]||'').toLowerCase(), prev=(input[i-1]||'').toLowerCase();
      const pair=low+next;
      if(pair==='nh'){out+=upper(ch,'њ');i++;continue;}
      if(pair==='lh'){out+=upper(ch,'љ');i++;continue;}
      if(pair==='ch'){out+=upper(ch,'x');i++;continue;}
      if(pair==='rr'||pair==='ss'){out+=upper(ch,pair==='rr'?'p':'c');i++;continue;}
      if(pair==='qu'&&/[eiéêí]/.test((input[i+2]||'').toLowerCase())){out+=upper(ch,'k');i++;continue;}
      if(pair==='gu'&&/[eiéêí]/.test((input[i+2]||'').toLowerCase())){out+=upper(ch,'г');i++;continue;}
      if(pair==='ia'&&i>0){out+=upper(ch,'я');i++;continue;}
      if(pair==='iu'&&i>0){out+=upper(ch,'ю');i++;continue;}
      if(low==='ã'){out+=upper(ch,'an');continue;} if(low==='õ'){out+=upper(ch,'on');continue;}
      if(low==='á'||low==='à'||low==='â'){out+=upper(ch,'a');continue;}
      if(low==='é'||low==='ê'){out+=upper(ch,'e');continue;}
      if(low==='í'){out+=upper(ch,'и');continue;}
      if(low==='ó'||low==='ô'){out+=upper(ch,'o');continue;}
      if(low==='ú'||low==='ü'){out+=upper(ch,'y');continue;}
      if(low==='c'){out+=upper(ch,/[eéií]/.test(next)?'c':'k');continue;}
      if(low==='ç'){out+=upper(ch,'c');continue;}
      if(low==='g'){out+=upper(ch,/[eéií]/.test(next)?'ж':'г');continue;}
      if(low==='j'){out+=upper(ch,'ж');continue;}
      if(low==='d'&&/[ií]/.test(next)){out+=upper(ch,'дж');continue;}
      if(low==='d'){out+=upper(ch,'д');continue;}
      if(low==='t'&&/[ií]/.test(next)){out+=upper(ch,'ч');continue;}
      if(low==='f'){out+=upper(ch,'φ');continue;}
      if(low==='i'){out+=upper(ch,'и');continue;}
      if(low==='p'){out+=upper(ch,'п');continue;}
      if(low==='u'){out+=upper(ch,'y');continue;}
      if(low==='s'){out+=upper(ch,isVowel(prev)&&isVowel(next)?'з':'c');continue;}
      if(low==='z'){out+=upper(ch,'з');continue;}
      if(low==='r'){out+=upper(ch,i===0||/[nls]/.test(prev)?'p':'r');continue;}
      if(low==='m'&&(i===input.length-1||!isVowel(next))){out+='n';continue;}
      if(low==='n'){out+=isVowel(prev)&&!isVowel(next)?'n':upper(ch,'h');continue;}
      if(low==='e'&&i===input.length-1){out+=upper(ch,'и');continue;}
      if(low==='o'&&i===input.length-1){out+=upper(ch,'y');continue;}
      if(low==='l'&&i===input.length-1){out+=upper(ch,'y');continue;}
      if(low==='l'){out+=upper(ch,'л');continue;}
      out+=ch;
    }
    return out;
  }

  function encode(text){
    const value=String(text??'').normalize('NFC');
    const match=value.match(/^(\s*)([\s\S]*?)(\s*)$/),core=match[2];
    const sample=logicalExamples.get(core)||visualExamples.get(core);
    if(sample)return match[1]+sample+match[3];
    return parts(value).map(part=>part.protected?part.text:part.text.replace(/[\p{L}\p{M}]+/gu,word)).join('');
  }

  const skipped='script,style,noscript,template,code,pre,textarea,input,svg,math,iframe,option,select,mjx-container,.katex,.MathJax,.peregrini-glyph,.portal-seal,.brand-mark,.pg-ltr,[aria-hidden="true"],[contenteditable]:not([contenteditable="false"]),[data-no-peregrini-codification]';
  const blockSelector='p,h1,h2,h3,h4,h5,h6,li,dt,dd,blockquote,figcaption,caption,td,th,label,summary,.doc-block';
  const processed=new WeakMap();
  const nativeLabels=new WeakMap();
  const documents=new WeakMap();
  const currentScript=typeof document!=='undefined'?document.currentScript:null;

  function asset(doc,name){
    const script=currentScript||doc.querySelector('script[src*="peregrini-codification.js"]');
    return new URL(name,script?.src||doc.baseURI).href;
  }

  function inScope(doc){return !!(doc.documentElement.hasAttribute('data-peregrini-codification')||doc.querySelector('.peregrini-portal,.peregrini-reading'));}

  function installStyle(doc){
    if(doc.getElementById('peregrini-codification-style'))return;
    // The essential direction rule also works while the visual stylesheet loads.
    const critical=doc.createElement('style');critical.id='peregrini-direction';
    critical.textContent='html[data-peregrini-layout="logical-rtl"] .pg-rtl{direction:rtl!important;unicode-bidi:bidi-override!important;text-align:start}html[data-peregrini-layout="logical-rtl"] .pg-ltr{direction:ltr!important;unicode-bidi:isolate!important}';
    doc.head.appendChild(critical);
    const style=doc.createElement('link');
    style.id='peregrini-codification-style';style.rel='stylesheet';
    style.href=asset(doc,'peregrini-codification.css?v=15');
    doc.head.appendChild(style);
  }

  function enhancePortal(doc){
    const hero=doc.querySelector('.peregrini-portal-hero');
    if(hero&&!hero.querySelector('.pg-intro')){
      const intro=doc.createElement('div');intro.className='pg-intro';
      while(hero.firstChild)intro.append(hero.firstChild);
      const seal=intro.querySelector('.portal-seal');if(seal)intro.prepend(seal);
      hero.append(intro);
      const figure=doc.createElement('figure');figure.className='pg-frontispiece';figure.setAttribute('aria-hidden','true');
      const img=doc.createElement('img');img.src=asset(doc,'pilgrim.png');img.alt='';
      img.width=1024;img.height=1536;img.decoding='async';
      img.addEventListener('error',()=>{figure.remove();hero.classList.add('pg-no-art');},{once:true});
      figure.append(img);hero.append(figure);
    }
    for(const region of doc.querySelectorAll('.language-table-wrap')){
      region.tabIndex=0;region.setAttribute('role','region');
      if(!region.hasAttribute('aria-label'))region.setAttribute('aria-label','Alfabeto Peregrini — tabela com rolagem horizontal');
    }
  }

  function convertNativeLabels(target){
    const element=target.nodeType===3?target.parentElement:target;
    if(!element||element.nodeType!==1||element.closest('[data-no-peregrini-codification],[contenteditable="true"]'))return;
    const options=element.matches('option')?[element]:[...element.querySelectorAll('option')];
    for(const option of options){
      if(option.closest('[data-no-peregrini-codification]'))continue;
      const value=option.textContent,previous=nativeLabels.get(option);
      if(previous===value)continue;
      const converted=parts(encode(value)).reverse().map(part=>part.protected?part.text:reverse(part.text)).join('');
      option.textContent=converted;nativeLabels.set(option,converted);
      option.closest('select')?.classList.add('pg-native-select');
    }
  }

  function enhanceReader(doc){
    // Leave the text within reach on a phone. Only set the initial state;
    // subsequent resizing must preserve the reader's choices.
    if(doc.body.classList.contains('peregrini-reading')&&doc.defaultView?.matchMedia?.('(max-width: 800px)').matches){
      for(const panel of doc.querySelectorAll('.reading-sidebar > details'))panel.open=false;
    }
  }

  function convertTextNode(node){
    const parent=node.parentElement,value=node.nodeValue;
    if(!parent||!value?.trim()||parent.closest(skipped)||processed.get(node)===value)return;
    // Each text-bearing element is RTL; the structural page grid stays separate.
    parent.classList.add('pg-rtl');
    parent.closest(blockSelector)?.classList.add('pg-rtl');
    const converted=encode(value),chunks=parts(converted);
    if(!chunks.some(part=>part.protected)){
      node.nodeValue=converted;processed.set(node,converted);return;
    }
    // Group a run so a flex button does not turn every number into a flex item.
    const run=node.ownerDocument.createElement('span');run.className='pg-run';
    for(const part of chunks){
      const text=node.ownerDocument.createTextNode(part.text);processed.set(text,part.text);
      if(part.protected){
        const span=node.ownerDocument.createElement('bdi');span.className='pg-ltr';span.dir='ltr';span.append(text);run.append(span);
      }else run.append(text);
    }
    node.replaceWith(run);
  }

  function convertTree(target){
    if(target.nodeType===3){convertTextNode(target);return;}
    if(target.nodeType!==1||target.closest(skipped))return;
    const doc=target.ownerDocument;
    const walker=doc.createTreeWalker(target,4); // SHOW_TEXT, independent of window globals.
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);
    nodes.forEach(convertTextNode);
  }

  function apply(doc){
    if(!doc?.body||!inScope(doc))return;
    if(documents.has(doc)){convertTree(doc.body);convertNativeLabels(doc.body);return;}
    installStyle(doc);
    doc.documentElement.dataset.peregriniCodification='portuguese';
    doc.documentElement.dataset.peregriniLayout='logical-rtl';
    doc.body.classList.add('pg-page');
    enhancePortal(doc);
    enhanceReader(doc);
    convertTree(doc.body);
    convertNativeLabels(doc.body);
    // Keep title, metadata, form values and accessible labels in their source form.
    // Screen readers, author inputs, sorting keys and links are never rewritten.
    const Observer=doc.defaultView?.MutationObserver;
    if(Observer){
      const options={subtree:true,childList:true,characterData:true};
      const observer=new Observer(records=>{
        observer.disconnect();
        try{
          const pending=new Set();
          records.forEach(record=>{
            if(record.type==='characterData')pending.add(record.target);
            else record.addedNodes.forEach(node=>pending.add(node));
          });
          pending.forEach(node=>{if(node.isConnected){convertTree(node);convertNativeLabels(node);}});
        }finally{observer.observe(doc.body,options);}
      });
      observer.observe(doc.body,options);documents.set(doc,observer);
    }else documents.set(doc,true);
    doc.documentElement.dataset.peregriniCodified='logical-rtl';
    // Native option labels are single-line visual strings; their values are intact.
  }

  const api={encode,word,apply,parts,version:15};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PeregriniPortugueseCodification=api;
  if(typeof document!=='undefined'){
    if(document.documentElement.hasAttribute('data-peregrini-codification'))installStyle(document);
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply(document),{once:true});else apply(document);
  }
})(typeof window!=='undefined'?window:{});
