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
  // Cada célula usa uma única palavra: ela é uma aproximação auditiva da
  // combinação da consoante com a vogal da coluna.
  const soundWords={
    B:['bala','bebê','bicho','biombo','burro','bola','bule'],
    K:['casa','querer','quilo','copo','cubo','caixa','cuca'],
    X:['caixa','chegar','chinelo','choro','chuva','chuchu','chave'],
    Д:['dado','dedo','dito','diodo','duro','dono','duna'],
    Φ:['faca','feliz','fita','foca','fumo','feira','fúria'],
    Ж:['janela','gelo','giro','jogo','juba','jeito','julho'],
    Г:['gato','guerra','guia','gota','gula','gêmeo','guitarra'],
    Л:['lado','lema','lima','lobo','lua','lago','luta'],
    Љ:['palha','colher','velhice','filhote','palhudo','malha','telhado'],
    M:['mala','mesa','mimo','mola','muro','maçã','muda'],
    H:['navio','neve','ninho','nome','nuvem','nada','nudez'],
    Њ:['aranha','companhia','ninho','sonho','nenhum','manhã','nhambu'],
    П:['pato','pelo','pipa','povo','pulo','paca','puma'],
    P:['rato','rede','rico','roda','rua','rala','ruma'],
    R:['cara','areia','ferida','caro','peru','cera','cura'],
    C:['sapo','cedo','sino','sopa','suco','sala','suma'],
    T:['tato','telha','tipo','toca','tubo','tala','tua'],
    Ч:['tchau','tchê','tchibum','tchã','tchaca','tchuru','tchutchuca'],
    V:['vaca','vela','vida','voto','vulto','vila','viva'],
    З:['azar','zero','zinco','zona','azul','zaga','zulu']
  };
  const vowelWords={
    A:['casa','cedo','ilha','iate','viúva','ovo','uva'],
    E:['mesa','bebê','ilha','iate','viúva','ovo','uva'],
    И:['míssil','medida','ilha','iate','viúva','ovo','uva'],
    Я:['piada','mediano','viagem','iate','viúva','violão','rua'],
    Ю:['viúva','miúdo','viagem','iate','viúva','violão','lua'],
    O:['casa','mesa','ilha','iate','viúva','ovo','uva'],
    Y:['lua','leu','lixo','iate','viúva','ovo','uva']
  };
  const fallbackWords=['casa','mesa','ilha','iate','viúva','ovo','uva'];
  const nasalWords=['lã','venda','tinta','gente','mundo','onda','nunca'];
  function examplesFor(upper){
    return vowels.map((v,index)=>{
      if(upper==='N')return {vowel:v.upper,sample:v.upper+'N',reference:nasalWords[index]};
      const words=soundWords[upper]||vowelWords[upper]||fallbackWords;
      return {vowel:v.upper,sample:upper+v.upper,reference:words[index]||fallbackWords[index]};
    });
  }
  const alphabet=rows.map(([upper,lower,sound,note])=>({upper,lower,sound,note,examples:examplesFor(upper)}));
  const defaults={
    name:'Peregrini',entryWord:'Пereгrиhи',word:'Cлovo Пereгrиhи',proceed:'Prosseguir Área Peregrini',
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
    for(const key of ['name','entryWord','word','proceed','notice'])if(value[key]!==undefined&&(typeof value[key]!=='string'||value[key].length>(key==='notice'?2500:150)))return false;
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
