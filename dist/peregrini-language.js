(function(root){
  'use strict';
  // Exact code points of Alfabeto Peregrini Oficial v5 (24/08/2026).
  // Latin P is the strong R. Latin H is /n/. Do not replace lookalikes.
  // Vogais usadas nos exemplos de leitura. A lista é deliberadamente explícita
  // para que o editor, a tabela pública e os testes compartilhem o mesmo inventário.
  const vowels=[
    {upper:'A',lower:'a',sound:'a'},
    {upper:'E',lower:'e',sound:'e'},
    {upper:'И',lower:'и',sound:'i /i/'},
    {upper:'Я',lower:'я',sound:'ia'},
    {upper:'Ю',lower:'ю',sound:'iu'},
    {upper:'O',lower:'o',sound:'o'},
    {upper:'Y',lower:'y',sound:'u'}
  ];
  const rows=[
    ['A','a','a','Como em casa.'],['B','b','b','Como em bola.'],
    ['K','k','k','Como em casa e quilo.'],['X','x','ch /ʃ/','Como em chave.'],
    ['Д','д','d','D puro, como em dado.'],['E','e','e','E médio, como no início de escola.'],
    ['Φ','φ','f','Como em faca.'],['Ж','ж','j /ʒ/','Como em jogo e gelo.'],
    ['И','и','i /i/','Vogal plena: MAИ se lê ma.i.'],['Я','я','ia','Iá unido; não se lê já.'],
    ['Ю','ю','iu','Iú unido; não se lê jú.'],['Г','г','g','Como em gato, guerra e guia.'],
    ['Л','л','l','Como em lado. Não termina palavra completa.'],['Љ','љ','lh /ʎ/','Como em palha e filho.'],
    ['M','m','m','Como em mala.'],['H','h','n','Consoante, como em navio.'],
    ['Њ','њ','nh /ɲ/','Como em ninho.'],['O','o','o','O médio, como no início de onde.'],
    ['П','п','p','Como em pato.'],['P','p','rr','R forte, como no início de rato.'],
    ['R','r','r /ɾ/','R fraco, como em caro.'],['C','c','s /s/','Sempre como em sal.'],
    ['T','t','t','T puro, como em tato.'],['Ч','ч','tch /tʃ/','Como em tchau.'],
    ['Y','y','u','Como em lua e música.'],['V','v','v','Como em vida.'],
    ['З','з','z /z/','Como em zero.'],['N','n','nasalização','Nasaliza a vogal anterior; não é a consoante n.']
  ];
  // Palavras portuguesas de apoio sonoro, não entradas do léxico Peregrini.
  // Nas colunas Я e Ю, duas palavras ajudam a unir consoante + ia/iu.
  const soundWords={
    B:['bala','bebê','bico','bola','bule'],
    K:['casa','querer','quilo','copo','cubo'],
    X:['chave','chegar','chinelo','choro','chuva'],
    Д:['dado','dedo','dito (d puro)','dono','duro'],
    Φ:['faca','feliz','fita','foca','fumo'],
    Ж:['janela','gelo','giro','jogo','juba'],
    Г:['gato','guerra','guia','gota','gula'],
    Л:['lado','lema','lima','lobo','lua'],
    Љ:['palha','colher','velhice','filhote','palhudo'],
    M:['mala','mesa','mimo','mola','muro'],
    H:['navio','neve','ninho','nome','nuvem'],
    Њ:['aranha','companheiro','ninho','sonho','nenhum'],
    П:['pato','pelo','pipa','povo','pulo'],
    P:['rato','rede','rico','roda','rua'],
    R:['cara','areia','ferida','caro','peru'],
    C:['sapo','cedo','sino','sopa','suco'],
    T:['tato','telha','tipo (t puro)','toca','tubo'],
    Ч:['tchau','tchê','tchibum','tchau + ovo','tchau + uva'],
    V:['vaca','vela','vida','voto','vulto'],
    З:['azar','zero','zinco','zona','azul']
  };
  const vowelWords={A:'casa',E:'mesa',И:'ilha',Я:'iate',Ю:'viu',O:'ovo',Y:'uva'};
  const nasalWords=['lã','vento','tinta','iate (com vogal nasalizada)','viu (com vogal nasalizada)','onda','mundo'];
  function examplesFor(upper){
    return vowels.map((v,index)=>{
      if(upper==='N')return {vowel:v.upper,sample:v.upper+'N',reference:nasalWords[index]};
      const words=soundWords[upper];
      const plainIndex={A:0,E:1,И:2,O:3,Y:4}[v.upper];
      const reference=words
        ? (plainIndex===undefined?words[0]+' + '+vowelWords[v.upper]:words[plainIndex])
        : vowelWords[upper]+' + '+vowelWords[v.upper];
      return {vowel:v.upper,sample:upper+v.upper,reference};
    });
  }
  const alphabet=rows.map(([upper,lower,sound,note])=>({upper,lower,sound,note,examples:examplesFor(upper)}));
  const defaults={
    name:'Peregrini',word:'Пereгrиhи Лovoc',proceed:'Prosseguir Área Peregrini',
    notice:'Esta área reúne escritos originais sobre a Via Peregrini Luminus como religião de orientação monoteísta, segundo minha visão pessoal. Ela encontra afinidades, em alguns aspectos, com Maimônides, Hasdai Crescas, Joseph Albo e Ibn Taymiyyah. A Via possui idioma próprio: o Peregrini.',
    alphabet,vowels,
    lexicon:[
      {term:'ДA',meaning:'Sim.',partOfSpeech:'expressao'},
      {term:'HИET',meaning:'Não.',partOfSpeech:'expressao'},
      {term:'MEHCAЖИ',meaning:'Mensagem; conteúdo transmitido.',partOfSpeech:'substantivo'},
      {term:'ЛYMИHY',meaning:'Luz enquanto fenômeno, conceito ou princípio luminoso.',partOfSpeech:'substantivo'},
      {term:'CAV',meaning:'Saber; possuir conhecimento.',partOfSpeech:'verbo'},
      {term:'CЛOVO',meaning:'Slovo: nome adotado para Palavra Peregrini, com raiz no russo слово.',partOfSpeech:'substantivo'}
    ]
  };
  const clone=x=>JSON.parse(JSON.stringify(x));
  function settings(value){return {...clone(defaults),...(value?clone(value):{})};}
  function validate(value){
    if(value===undefined)return true;
    if(!value||Array.isArray(value)||typeof value!=='object')return false;
    for(const key of ['name','word','proceed','notice'])if(value[key]!==undefined&&(typeof value[key]!=='string'||value[key].length>(key==='notice'?2500:150)))return false;
    if(value.name!==undefined&&!value.name.trim())return false;
    if(value.alphabet!==undefined){
      if(!Array.isArray(value.alphabet)||value.alphabet.length>100)return false;
      const used=new Set();
      for(const a of value.alphabet){if(!a||!['upper','lower','sound','note'].every(k=>typeof a[k]==='string'&&a[k].length<=500)||!a.upper||!a.lower||used.has(a.upper))return false;used.add(a.upper);}
    }
    if(value.lexicon!==undefined){
      if(!Array.isArray(value.lexicon)||value.lexicon.length>2000)return false;
      const used=new Set();
      for(const x of value.lexicon){
        if(!x||typeof x.term!=='string'||!x.term.trim()||x.term.length>150||typeof x.meaning!=='string'||!x.meaning.trim()||x.meaning.length>1500)return false;
        if(x.pronunciation!==undefined&&(typeof x.pronunciation!=='string'||x.pronunciation.length>200))return false;
        if(x.example!==undefined&&(typeof x.example!=='string'||x.example.length>1000))return false;
        if(x.partOfSpeech!==undefined&&(typeof x.partOfSpeech!=='string'||!partOfSpeechLabels[x.partOfSpeech]))return false;
        const key=normalize(x.term);if(used.has(key))return false;used.add(key);
      }
    }
    return true;
  }
  const partOfSpeechLabels={substantivo:'Substantivo',verbo:'Verbo',adjetivo:'Adjetivo',adverbio:'Advérbio',expressao:'Expressão'};
  const normalize=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().trim();
  const ranks=new Map(rows.map(([upper],i)=>[upper,i]));
  function compareTerms(a,b){
    const aa=Array.from(normalize(a)),bb=Array.from(normalize(b));
    for(let i=0;i<Math.min(aa.length,bb.length);i++){
      const difference=(ranks.get(aa[i])??1000+aa[i].codePointAt(0))-(ranks.get(bb[i])??1000+bb[i].codePointAt(0));
      if(difference)return difference;
    }
    return aa.length-bb.length;
  }
  function filterLexicon(entries,{query='',letter='',order='alphabet'}={}){
    const words=normalize(query).split(/\s+/).filter(Boolean);
    const filtered=entries.filter(entry=>{
      const haystack=normalize([entry.term,entry.meaning,entry.pronunciation,entry.example,entry.partOfSpeech,partOfSpeechLabels[entry.partOfSpeech]].filter(Boolean).join(' '));
      return (!letter||normalize(entry.term).startsWith(normalize(letter)))&&words.every(word=>haystack.includes(word));
    });
    return order==='author'?filtered:filtered.sort((a,b)=>compareTerms(a.term,b.term)*(order==='reverse'?-1:1));
  }
  const isPeregrini=w=>w?.language==='peregrini';
  const code=s=>[...s].map(c=>'U+'+c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')).join(' ');
  const api={alphabet,vowels,defaults,partOfSpeechLabels,settings,validate,isPeregrini,code,normalize,compareTerms,filterLexicon};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PeregriniLanguage=api;
})(typeof window!=='undefined'?window:{});
