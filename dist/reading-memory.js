(() => {
'use strict';
const root=new URL('.',document.currentScript.src),key='peregrini:reading:v1:'+root.pathname;
function read(){try{const d=JSON.parse(localStorage.getItem(key));if(!d||typeof d.path!=='string'||!/^obras\/[a-z0-9-]+\/(didatico|sintetico)\.html$/.test(d.path)||typeof d.title!=='string'||!Number.isFinite(d.y)||d.y<0)return null;return d;}catch{return null;}}
const memory=read(),article=document.querySelector('.reading-text');
if(!article){const box=document.querySelector('#resume-reading');if(!box||!memory)return;const link=box.querySelector('a');if(![...document.querySelectorAll('.card-action')].some(a=>a.href===new URL(memory.path,root).href))return;link.href=new URL(memory.path+'?retomar=1',root).href;link.textContent='Retomar: '+memory.title;box.hidden=false;box.querySelector('button').onclick=()=>{try{localStorage.removeItem(key);}catch{}box.hidden=true;};return;}
const path=location.pathname.slice(root.pathname.length);if(!/^obras\/[a-z0-9-]+\/(didatico|sintetico)\.html$/.test(path))return;
const box=document.querySelector('#resume-reading'),same=memory?.path===path;
function restore(){if(!same)return;const section=typeof memory.chapter==='string'?document.getElementById(memory.chapter):null;const y=section?section.getBoundingClientRect().top+scrollY+Math.min(Math.max(0,memory.offset||0),Math.max(0,section.offsetHeight-80)):memory.y;window.scrollTo({top:y,behavior:'instant'});box.hidden=true;save();}
if(same&&memory.y>200){box.hidden=false;box.querySelector('button').onclick=restore;if(new URLSearchParams(location.search).get('retomar')==='1'&&!location.hash)window.addEventListener('load',restore,{once:true});}
let timer;
function save(){if(scrollY<200)return;let section;for(const node of article.querySelectorAll('.chapter'))if(node.getBoundingClientRect().top<=100)section=node;const value={path,title:article.querySelector('h1').textContent,y:scrollY,chapter:section?.id||'',offset:section?Math.max(0,scrollY-(section.getBoundingClientRect().top+scrollY)):0};try{localStorage.setItem(key,JSON.stringify(value));}catch{}}
window.addEventListener('scroll',()=>{clearTimeout(timer);timer=setTimeout(save,350);},{passive:true});window.addEventListener('pagehide',save);
})();
