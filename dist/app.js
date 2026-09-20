(() => {
  'use strict';
  const prefs=window.PeregriniPreferences;
  const toggle=document.querySelector('#theme-toggle');
  function theme(){return prefs?.state?.theme||document.documentElement.dataset.theme||'luz';}
  function syncTheme(){
    if(!toggle)return;
    const dark=theme()==='noite';
    toggle.setAttribute('aria-label',dark?'Ativar tema claro':'Ativar tema escuro');
    toggle.setAttribute('aria-pressed',String(dark));
  }
  toggle?.addEventListener('click',()=>{
    const next=theme()==='noite'?'luz':'noite';
    if(prefs?.set)prefs.set({theme:next});else document.documentElement.dataset.theme=next;
    syncTheme();
  });
  syncTheme();

  const menu=document.querySelector('#menu-button');
  const nav=document.querySelector('#mobile-nav');
  if(menu&&nav){
    function setMenu(open,restoreFocus=false){
      nav.hidden=!open;menu.setAttribute('aria-expanded',String(open));
      if(restoreFocus)menu.focus();
    }
    setMenu(!nav.hidden);
    menu.addEventListener('click',()=>setMenu(nav.hidden));
    nav.addEventListener('click',event=>{if(event.target.closest('a'))setMenu(false);});
    document.addEventListener('keydown',event=>{
      if(event.key==='Escape'&&!nav.hidden){setMenu(false,true);event.preventDefault();}
    });
    document.addEventListener('click',event=>{
      if(!nav.hidden&&!nav.contains(event.target)&&!menu.contains(event.target))setMenu(false);
    });
    const wide=window.matchMedia?.('(min-width: 801px)');
    wide?.addEventListener?.('change',event=>{if(event.matches)setMenu(false);});
  }

  const search=document.querySelector('#search-input');
  const format=document.querySelector('#format-filter');
  const filters=[...document.querySelectorAll('.filter')];
  let active='todos';
  const normalize=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const searchText=new WeakMap();
  function update(){
    if(!search||!format)return;
    let count=0;
    for(const card of document.querySelectorAll('#work-grid .work-card')){
      if(!searchText.has(card))searchText.set(card,normalize(card.dataset.search||card.textContent));
      const status=active==='todos'||card.dataset.status===active;
      const variant=format.value==='todos'||card.dataset.format===format.value;
      const match=searchText.get(card).includes(normalize(search.value.trim()));
      card.hidden=!(status&&variant&&match);if(!card.hidden)count++;
    }
    const empty=document.querySelector('#empty-state');if(empty)empty.hidden=count>0;
  }
  if(search&&format){
    filters.forEach(button=>button.addEventListener('click',()=>{
      active=button.dataset.filter;
      filters.forEach(filter=>{
        filter.classList.toggle('is-active',filter===button);
        filter.setAttribute('aria-pressed',String(filter===button));
      });
      update();
    }));
    search.addEventListener('input',update);format.addEventListener('change',update);update();
  }

  document.querySelectorAll('[data-sort]').forEach(select=>select.addEventListener('change',()=>{
    const grid=document.getElementById(select.dataset.sort);if(!grid)return;
    const cards=[...grid.children];
    const author=(a,b)=>(Number(a.dataset.order)||0)-(Number(b.dataset.order)||0);
    cards.sort((a,b)=>{
      if(select.value==='author')return author(a,b);
      const x=a.dataset.date||'',y=b.dataset.date||'';
      if(!x||!y)return x?-1:y?1:author(a,b);
      return (select.value==='newest'?y.localeCompare(x):x.localeCompare(y))||author(a,b);
    });
    grid.append(...cards);
  }));

  const panels=[...document.querySelectorAll('details.collection-section')];
  function openCollectionHash(){
    let id;try{id=decodeURIComponent(location.hash.slice(1));}catch{return;}
    const panel=panels.find(item=>item.id===id);
    if(panel)panels.forEach(item=>{item.open=item===panel;});
  }
  panels.forEach(panel=>panel.addEventListener('toggle',()=>{
    if(panel.open)panels.forEach(other=>{if(other!==panel)other.open=false;});
  }));
  window.addEventListener('hashchange',openCollectionHash);openCollectionHash();
})();

