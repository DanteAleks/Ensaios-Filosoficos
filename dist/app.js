(() => {
const prefs=window.PeregriniPreferences;
const toggle=document.querySelector('#theme-toggle');
function syncTheme(){toggle.setAttribute('aria-label',prefs.state.theme==='noite'?'Ativar tema claro':'Ativar tema escuro');}
toggle.onclick=()=>{prefs.set({theme:prefs.state.theme==='noite'?'luz':'noite'});syncTheme();};syncTheme();
const menu=document.querySelector('#menu-button'),nav=document.querySelector('#mobile-nav');
menu.onclick=()=>{nav.hidden=!nav.hidden;menu.setAttribute('aria-expanded',String(!nav.hidden));};
nav.onclick=e=>{if(e.target.closest('a')){nav.hidden=true;menu.setAttribute('aria-expanded','false');}};
const search=document.querySelector('#search-input'),format=document.querySelector('#format-filter'),filters=[...document.querySelectorAll('.filter')];let active='todos';
const normalize=t=>t.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
function update(){let n=0;document.querySelectorAll('#work-grid .work-card').forEach(c=>{c.hidden=!((active==='todos'||c.dataset.status===active)&&(format.value==='todos'||c.dataset.format===format.value)&&normalize(c.textContent).includes(normalize(search.value.trim())));if(!c.hidden)n++;});document.querySelector('#empty-state').hidden=!!n;}
filters.forEach(b=>b.onclick=()=>{active=b.dataset.filter;filters.forEach(f=>{f.classList.toggle('is-active',f===b);f.setAttribute('aria-pressed',String(f===b));});update();});search.oninput=update;format.onchange=update;update();
})();
