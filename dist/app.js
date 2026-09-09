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
function update(){if(!search||!format)return;let n=0;document.querySelectorAll('#work-grid .work-card').forEach(c=>{c.hidden=!((active==='todos'||c.dataset.status===active)&&(format.value==='todos'||c.dataset.format===format.value)&&normalize(c.textContent).includes(normalize(search.value.trim())));if(!c.hidden)n++;});const empty=document.querySelector('#empty-state');if(empty)empty.hidden=!!n;}
if(search&&format){filters.forEach(b=>b.onclick=()=>{active=b.dataset.filter;filters.forEach(f=>{f.classList.toggle('is-active',f===b);f.setAttribute('aria-pressed',String(f===b));});update();});search.oninput=update;format.onchange=update;update();}
document.querySelectorAll('[data-sort]').forEach(select=>select.addEventListener('change',()=>{const grid=document.getElementById(select.dataset.sort);const cards=[...grid.children];cards.sort((a,b)=>{if(select.value==='author')return Number(a.dataset.order)-Number(b.dataset.order);const x=a.dataset.date,y=b.dataset.date;if(!x||!y)return x?-1:y?1:Number(a.dataset.order)-Number(b.dataset.order);return (select.value==='newest'?y.localeCompare(x):x.localeCompare(y))||Number(a.dataset.order)-Number(b.dataset.order);});grid.append(...cards);}));
const collectionPanels=[...document.querySelectorAll('details.collection-section')];
function openCollectionHash(){let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}const panel=collectionPanels.find(p=>p.id===id);if(panel){panel.open=true;collectionPanels.forEach(p=>{if(p!==panel)p.open=false;});}}
collectionPanels.forEach(panel=>panel.addEventListener('toggle',()=>{if(panel.open)collectionPanels.forEach(other=>{if(other!==panel)other.open=false;});}));
window.addEventListener('hashchange',openCollectionHash);openCollectionHash();
})();


