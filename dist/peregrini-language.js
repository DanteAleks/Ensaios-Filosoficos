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
  const alphabet=rows.map(([upper,lower,sound,note])=>({
    upper,lower,sound,note,status:'ratificado',
    // Combinações de demonstração: não são palavras do léxico.
    examples:vowels.map(v=>({
      vowel:v.upper,
      upper:`${upper}${v.upper}`,
      lower:`${lower}${v.lower}`
    }))
  }));
  const defaults={
    name:'Peregrini',word:'CЛOVO',proceed:'Prosseguir a via',
    notice:'Esta área reúne escritos originais sobre a Via Peregrini Luminus como religião de orientação monoteísta, segundo minha visão pessoal. Ela encontra afinidades, em alguns aspectos, com Maimônides, Hasdai Crescas, Joseph Albo e Ibn Taymiyyah. A Via possui idioma próprio: o Peregrini.',
    alphabet,vowels,
    lexicon:[
      {term:'ДA',meaning:'Sim.',status:'ratificado'},
      {term:'HИET',meaning:'Não.',status:'ratificado'},
      {term:'MEHCAЖИ',meaning:'Mensagem; conteúdo transmitido.',status:'ratificado'},
      {term:'ЛYMИHY',meaning:'Luz enquanto fenômeno, conceito ou princípio luminoso.',status:'ratificado'},
      {term:'CAV',meaning:'Saber; possuir conhecimento.',status:'ratificado'},
      {term:'CЛOVO',meaning:'Slovo: nome adotado para Palavra Peregrini, com raiz no russo слово.',status:'adotado'}
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
      for(const a of value.alphabet){if(!a||!['upper','lower','sound','note','status'].every(k=>typeof a[k]==='string'&&a[k].length<=500)||!a.upper||!a.lower||used.has(a.upper))return false;used.add(a.upper);}
    }
    if(value.lexicon!==undefined&&(!Array.isArray(value.lexicon)||value.lexicon.length>2000||!value.lexicon.every(x=>x&&typeof x.term==='string'&&x.term.trim()&&x.term.length<=150&&typeof x.meaning==='string'&&x.meaning.length<=1500&&typeof x.status==='string'&&x.status.length<=60)))return false;
    return true;
  }
  const isPeregrini=w=>w?.language==='peregrini';
  const code=s=>[...s].map(c=>'U+'+c.codePointAt(0).toString(16).toUpperCase().padStart(4,'0')).join(' ');
  const api={alphabet,vowels,defaults,settings,validate,isPeregrini,code};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PeregriniLanguage=api;
})(typeof window!=='undefined'?window:{});
