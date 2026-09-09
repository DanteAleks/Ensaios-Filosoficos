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
  // Transcrição da coluna “Combinações e exemplos vocálicos em português”
  // do Alfabeto Peregrini Oficial v5, de 24 de agosto de 2026. Não invente
  // substitutos nesta tabela: as aproximações fazem parte do documento oficial.
  const officialExamples={
    A:[['A','casa'],['AN','lã, maçã']],
    B:[['BA','bala'],['BE','beleza'],['BИ','bico'],['BO','bola'],['BY','buraco'],['BЯ','biá'],['BЮ','biú']],
    K:[['KA','casa'],['KE','quero'],['KИ','quilo'],['KO','coisa'],['KY','culinária'],['KЯ','kiá'],['KЮ','kiú']],
    X:[['XA','chave'],['XE','cheio'],['XИ','xícara'],['XO','choque'],['XY','chuva'],['XЯ','chiá'],['XЮ','chiú']],
    Д:[['ДA','dado'],['ДE','dedo'],['ДИ','di'],['ДO','dono'],['ДY','duro'],['ДЯ','diá'],['ДЮ','diú']],
    E:[['E','escola, elefante'],['EN','ẽ aproximado, como o primeiro E de “tempo”']],
    Φ:[['ΦA','faca'],['ΦE','feira'],['ΦИ','fita'],['ΦO','fogo'],['ΦY','fumaça'],['ΦЯ','fiá'],['ΦЮ','fiú']],
    Ж:[['ЖA','jato'],['ЖE','jeito'],['ЖИ','girafa'],['ЖO','jogo'],['ЖY','juro'],['ЖЯ','jiá'],['ЖЮ','jiú']],
    И:[['И','vida'],['ИN','sim, fim'],['MAИ','/ma.i/']],
    Я:[['Я','iá como unidade Peregrini; aproximadamente a sequência “iá” de piá'],['ЯN','iã']],
    Ю:[['Ю','iú como unidade Peregrini; aproximadamente a sequência “iú”'],['ЮN','iũ']],
    Г:[['ГA','gato'],['ГE','guerra'],['ГИ','guia'],['ГO','gota'],['ГY','gula'],['ГЯ','guiá'],['ГЮ','guiú']],
    Л:[['ЛA','lado'],['ЛE','leite'],['ЛИ','livro'],['ЛO','lobo'],['ЛY','lua'],['ЛЯ','liá'],['ЛЮ','liú']],
    Љ:[['ЉA','lha'],['ЉE','lhe'],['ЉИ','lhi'],['ЉO','lho'],['ЉY','lhu'],['ЉЯ','lhiá'],['ЉЮ','lhiú']],
    M:[['MA','mala'],['ME','mesa'],['MИ','milho'],['MO','moda'],['MY','música'],['MЯ','miá'],['MЮ','miú']],
    H:[['HA','navio'],['HE','neve'],['HИ','nível'],['HO','nome'],['HY','nuvem'],['HЯ','niá'],['HЮ','niú']],
    Њ:[['ЊA','“nha” de manhã'],['ЊE','nhe'],['ЊИ','“nhi” de ninho'],['ЊO','“nho” de sonho'],['ЊY','nhu'],['ЊЯ','nhiá'],['ЊЮ','nhiú']],
    O:[['O','onde, ostra'],['ON','õ, como o primeiro O de “onde”']],
    П:[['ПA','pato'],['ПE','pedra'],['ПИ','pino'],['ПO','povo'],['ПY','puro'],['ПЯ','piá'],['ПЮ','piú']],
    P:[['PA','rato'],['PE','remo'],['PИ','rio'],['PO','roda'],['PY','rua'],['PЯ','riá forte'],['PЮ','riú forte']],
    R:[['RA','arara'],['RE','parede'],['RИ','perigo'],['RO','caro'],['RY','peru'],['RЯ','riá'],['RЮ','riú']],
    C:[['CA','salada'],['CE','cegonha'],['CИ','Sicília'],['CO','sobre'],['CY','sul'],['CЯ','siá'],['CЮ','siú']],
    T:[['TA','tato'],['TE','tela'],['TИ','ti'],['TO','toca'],['TY','tudo'],['TЯ','tiá'],['TЮ','tiú']],
    Ч:[['ЧA','tchau'],['ЧE','tchê'],['ЧИ','tchim'],['ЧO','tcho'],['ЧY','tchu'],['ЧЯ','tchiá'],['ЧЮ','tchiú'],['ЧAИ','/tʃa.i/']],
    Y:[['Y','lua, música'],['YN','um, mundo']],
    V:[['VA','vaca'],['VE','vela'],['VИ','vida'],['VO','voto'],['VY','vulcão'],['VЯ','viá'],['VЮ','viú']],
    З:[['ЗA','zaga'],['ЗE','zero'],['ЗИ','zíper'],['ЗO','zona'],['ЗY','zulu'],['ЗЯ','ziá'],['ЗЮ','ziú']],
    N:[['AN','lã, maçã'],['EN','ẽ de “tempo”'],['ИN','sim, fim'],['ON','õ de “onde”'],['YN','um, mundo'],['ЯN','iã'],['ЮN','iũ']]
  };
  function examplesFor(upper){
    return (officialExamples[upper]||[]).map(([sample,reference])=>({sample,reference}));
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
