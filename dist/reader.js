(() => {
  const prefs=window.PeregriniPreferences,size=document.querySelector('#reading-size'),font=document.querySelector('#reading-font'),theme=document.querySelector('#reading-theme'),output=document.querySelector('#size-value');
  function sync(){size.value=prefs.state.size;font.value=prefs.state.font;theme.value=prefs.state.theme;output.value=`${prefs.state.size}%`;size.setAttribute('aria-valuetext',output.value);}
  size.addEventListener('input',()=>{prefs.set({size:Number(size.value)});sync();});
  font.addEventListener('change',()=>prefs.set({font:font.value}));theme.addEventListener('change',()=>prefs.set({theme:theme.value}));
  document.querySelector('#reset-reading').addEventListener('click',()=>{prefs.reset();sync();});document.querySelector('#print-reading').addEventListener('click',()=>window.print());sync();
  const links=[...document.querySelectorAll('#sumario a')];
  function mark(){links.forEach(a=>{if(a.hash===location.hash)a.setAttribute('aria-current','location');else a.removeAttribute('aria-current');});}
  window.addEventListener('hashchange',mark);mark();
  document.querySelectorAll('a[href^="#"]').forEach(a=>a.addEventListener('click',()=>{const target=document.getElementById(a.hash.slice(1));if(target?.matches('.chapter'))target.focus({preventScroll:true});}));
})();
