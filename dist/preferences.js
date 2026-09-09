(() => {
  const fonts={
    classica:"Georgia, 'Times New Roman', serif",
    livro:"Palatino, 'Palatino Linotype', 'Book Antiqua', serif",
    'peregrini-text':"'Palavra Peregrini Texto', Georgia, serif",
    // Alias mantido para preferências gravadas nas versões anteriores.
    peregrini:"'Palavra Peregrini Texto', Georgia, serif",
    'peregrini-display':"'Palavra Peregrini Display', Georgia, serif",
    'peregrini-iluminada':"'Palavra Peregrini Iluminada', Georgia, serif",
    simples:'Arial, Helvetica, sans-serif'
  };
  const pageDefault=(document.documentElement.dataset.readingLanguage==='peregrini'||document.querySelector('.peregrini-document'))?'peregrini-text':'classica';
  const defaults={theme:'luz',font:pageDefault,size:100};
  let stored={};try{stored=JSON.parse(localStorage.getItem('peregrini-reading')||'{}')||{};}catch{}
  if(stored.font==='peregrini')stored.font='peregrini-text';
  let previous;try{previous=localStorage.getItem('peregrini-theme');}catch{}
  const state={
    theme:['luz','noite'].includes(stored.theme)?stored.theme:['luz','noite'].includes(previous)?previous:'luz',
    font:fonts[stored.font]?stored.font:pageDefault,
    size:[80,90,100,110,120,130,140,150,160].includes(stored.size)?stored.size:100
  };
  function apply(){
    document.documentElement.dataset.theme=state.theme;
    document.documentElement.style.setProperty('--reading-font',fonts[state.font]);
    document.documentElement.style.setProperty('--reading-size',`${state.size/100*1.25}rem`);
  }
  function set(patch){
    if(['luz','noite'].includes(patch.theme))state.theme=patch.theme;
    if(fonts[patch.font])state.font=patch.font==='peregrini'?'peregrini-text':patch.font;
    if([80,90,100,110,120,130,140,150,160].includes(patch.size))state.size=patch.size;
    apply();
    try{localStorage.setItem('peregrini-reading',JSON.stringify(state));localStorage.setItem('peregrini-theme',state.theme);}catch{}
  }
  apply();
  window.PeregriniPreferences={state,set,reset:()=>set(defaults)};
})();
