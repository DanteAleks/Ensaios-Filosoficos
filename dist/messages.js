(() => {
 'use strict';
 const box=document.querySelector('[data-author-message]');if(!box)return;
 const work=box.dataset.authorMessage,form=box.querySelector('form'),notice=box.querySelector('[data-message-status]')||box.querySelector('[role="status"]'),fieldset=box.querySelector('fieldset');
 const base=window.PeregriniReactionsConfig?.apiUrl?.trim().replace(/\/$/,'');
 function api(){try{const u=new URL(base);if(u.protocol!=='https:'||u.username||u.password||u.pathname!=='/'||u.search||u.hash)throw Error();return u.origin;}catch{return null;}}
 const endpoint=api();
 const uid=()=>Array.from(crypto.getRandomValues(new Uint8Array(16)),b=>b.toString(16).padStart(2,'0')).join('');
 let requestId=uid(),busy=false;
 async function post(path,data,keepalive=false){const r=await fetch(endpoint+path,{method:'POST',headers:{'Content-Type':'application/json'},credentials:'omit',cache:'no-store',body:JSON.stringify(data),keepalive,signal:AbortSignal.timeout(15000)});let result;try{result=await r.json();}catch{throw Error('Não foi possível confirmar o envio. Tente novamente.');}if(!r.ok||!result.ok)throw Error(result.error||'Não foi possível confirmar o envio. Tente novamente.');return result;}
 form.addEventListener('submit',async e=>{e.preventDefault();if(busy||!form.reportValidity())return;if(!endpoint){notice.textContent='Mensagens indisponíveis no momento. Você pode usar o botão de e-mail.';return;}busy=true;fieldset.disabled=true;notice.textContent='Enviando…';const data={work,requestId,name:form.elements.namedItem('name').value,email:form.elements.namedItem('email').value,message:form.elements.namedItem('message').value};try{await post('/messages',data);form.reset();requestId=uid();notice.textContent='Mensagem enviada ao autor. A resposta poderá chegar ao e-mail informado.';}catch(e){notice.textContent=e.name==='TypeError'||e.name==='TimeoutError'?'Não foi possível confirmar o envio. Seu texto foi preservado; tente novamente.':e.message;}finally{busy=false;fieldset.disabled=false;}});
 // A click is an indication only. Never prevent the email application from opening.
 let lastClick=0;
 document.querySelectorAll('.contact-email').forEach(a=>a.addEventListener('click',()=>{if(!endpoint||Date.now()-lastClick<30000)return;lastClick=Date.now();post('/email-click',{work,requestId:uid()},true).catch(()=>{});}));
})();

