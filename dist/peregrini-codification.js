(function(root){
  'use strict';

  const exact=new Map([
    ['Informação prévia','яverп ynaсampoφnИ'],
    ['A Via e seus escritos','cytиrkcи cyec и aиV A'],
    ['Esta área reúne escritos originais sobre a Via Peregrini Luminus como uma religião de orientação monoteísta, segundo minha visão pessoal. Ela encontra afinidades, em alguns aspectos, com Maimônides, Hasdai Crescas, Joseph Albo e Ibn Taymiyyah. A Via possui idioma próprio: o Peregrini.','.иhиrгereП y :yиrпorп amoижди иyзoп aиV A .яиmиaT hbИ и ybyA φeзoЖ ,cakcerK иaдзA ,cиждиhomиaM nok ,cytkeпca cnyглa ne ,cиждадиhиφa artnokne aлE .yaoceп ynaзиv aњиm ydnyгec ,atcиetohom ynaсatneиro ижд ynяжилep amy ymok cyhиmyЛ иhиrгereП aиV a erboc cиahижиro cytиrkcи иhyep aera atcE'],
    ['Prosseguir Área Peregrini','иhиrгereП aerA piгecorП']
  ]);

  const vowels='aeiouáàâãéêíóôõúü';
  const isVowel=c=>vowels.includes((c||'').toLowerCase());
  const upper=(source,value)=>source===source.toUpperCase()?value.toUpperCase():value;

  function word(input){
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
      if(low==='ã'){out+='an';continue;} if(low==='õ'){out+='on';continue;}
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
      out+=ch;
    }
    return out;
  }

  function encode(text){
    if(exact.has(text))return exact.get(text);
    const converted=text.replace(/[A-Za-zÀ-ÖØ-öø-ÿ]+/g,word);
    const parts=converted.split(/(\d+(?:[.,:/-]\d+)*%?)/g);
    return parts.reverse().map(part=>/^\d/.test(part)?part:Array.from(part).reverse().join('')).join('');
  }

  function convertTextNode(node){
    if(!node.nodeValue||!node.nodeValue.trim())return;
    const match=node.nodeValue.match(/^(\s*)([\s\S]*?)(\s*)$/);
    node.nodeValue=match[1]+encode(match[2])+match[3];
  }

  function apply(doc){
    if(!doc?.documentElement||doc.documentElement.dataset.peregriniCodified==='true')return;
    doc.title=encode(doc.title);
    const description=doc.querySelector('meta[name="description"]');
    if(description)description.content=encode(description.content);
    const walker=doc.createTreeWalker(doc.body,NodeFilter.SHOW_TEXT,{acceptNode(node){
      const parent=node.parentElement;
      if(!parent||parent.closest('script,style,code,pre,.peregrini-glyph,.portal-seal,.brand-mark,[data-no-peregrini-codification]'))return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }});
    const nodes=[];while(walker.nextNode())nodes.push(walker.currentNode);nodes.forEach(convertTextNode);
    doc.querySelectorAll('[aria-label],[title],[placeholder]').forEach(el=>{
      for(const name of ['aria-label','title','placeholder'])if(el.hasAttribute(name))el.setAttribute(name,encode(el.getAttribute(name)));
    });
    doc.documentElement.dataset.peregriniCodified='true';
  }

  const api={encode,word,apply};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PeregriniPortugueseCodification=api;
  if(typeof document!=='undefined'){
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>apply(document),{once:true});else apply(document);
  }
})(typeof window!=='undefined'?window:{});
