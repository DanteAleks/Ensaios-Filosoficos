(() => {
 'use strict';
 const box=document.querySelector('[data-reactions-work]');if(!box)return;
 const buttons=[...box.querySelectorAll('button[data-vote]')],message=box.querySelector('[role="status"]'),count=box.querySelector('[data-like-count]'),work=box.dataset.reactionsWork;
 const base=window.PeregriniReactionsConfig?.apiUrl?.trim().replace(/\/$/,'');
 if(!base){message.textContent='As avaliações estão aguardando ativação.';return;}
 let api;try{api=new URL(base);if(api.protocol!=='https:'||api.username||api.password||api.search||api.hash||api.pathname!=='/')throw Error();}catch{message.textContent='As avaliações estão indisponíveis no momento.';return;}
 const key='peregrini:reaction:'+work,identityKey='peregrini:reaction-voter:v1';let voter='',selected='none',busy=false;
 function render(){buttons.forEach(b=>{b.disabled=busy;b.setAttribute('aria-pressed',String(selected===b.dataset.vote));});}
 async function request(path,options={}){const r=await fetch(base+path,{...options,credentials:'omit',cache:'no-store',signal:AbortSignal.timeout(12000)});const data=await r.json();if(!r.ok)throw Error(data.error||'Não foi possível confirmar a avaliação. Tente novamente.');if(!Number.isInteger(data.likes)||data.likes<0)throw Error('Resposta inválida. Tente novamente.');count.textContent=String(data.likes);return data;}
 async function init(){try{voter=localStorage.getItem(identityKey)||'';if(!/^[a-f0-9]{32}$/.test(voter)){voter=Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');localStorage.setItem(identityKey,voter);}const stored=localStorage.getItem(key);if(['like','dislike'].includes(stored))selected=stored;}catch{message.textContent='Permita o armazenamento neste navegador para registrar sua avaliação.';return;}
  try{await request('/counts?work='+encodeURIComponent(work));message.textContent='Você pode alterar ou retirar sua avaliação.';}catch{message.textContent='Não foi possível carregar os corações. Você pode tentar avaliar.';}render();
 }
 buttons.forEach(button=>button.addEventListener('click',async()=>{if(busy||!voter)return;busy=true;render();const next=selected===button.dataset.vote?'none':button.dataset.vote;message.textContent='Registrando…';try{const result=await request('/vote',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({work,voter,value:next})});if(result.selection!==next)throw Error('Não foi possível confirmar a avaliação. Tente novamente.');selected=next;try{localStorage.setItem(key,selected);}catch{}message.textContent=next==='none'?'Avaliação retirada.':next==='dislike'?'Avaliação registrada. A contagem de “não gostei” é privada.':'Obrigado pela avaliação!';}catch(e){message.textContent=e instanceof TypeError||e.name==='TimeoutError'?'Não foi possível confirmar a avaliação. Tente novamente.':e.message;}finally{busy=false;render();}}));
 init();
})();
