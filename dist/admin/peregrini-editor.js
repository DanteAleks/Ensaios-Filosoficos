(function(root){
  'use strict';
  const D=root.PeregriniDocument;
  root.mountPeregriniEditor=function(host,v,changed){
    host.innerHTML='<div class="peregrini-toolbar" role="toolbar" aria-label="Ferramentas de escrita Peregrini"><label>Estilo <select data-peregrini-style><option value="p">Parágrafo</option><option value="h2">Título</option><option value="h3">Subtítulo</option><option value="blockquote">Citação</option></select></label><button type="button" data-peregrini-direction>Alternar direção</button><button type="button" data-peregrini-initial>Capitular iluminada</button><div class="peregrini-palette" aria-label="Letras Peregrini"></div></div><div class="document-editor peregrini-document" contenteditable="true" role="textbox" aria-label="Documento original em Peregrini" aria-multiline="true" spellcheck="false"></div><p class="help">A ordem armazenada permanece fiel ao que você digita. A direção visual é aplicada ao leitor. Use a paleta para inserir letras oficiais; a tabela completa está na área pública Peregrini.</p>';
    const toolbar=host.querySelector('.peregrini-toolbar'),editor=host.querySelector('.document-editor'),palette=host.querySelector('.peregrini-palette');
    editor.innerHTML=D.render(D.fromVersion(v));editor.dataset.study=v.direction==='ltr'?'ltr':'rtl';editor.dir=v.direction||'rtl';
    for(const a of (root.PeregriniLanguage?.alphabet||[])){const b=document.createElement('button');b.type='button';b.textContent=a.upper;b.title=`${a.upper} / ${a.lower} · ${a.sound}`;b.setAttribute('aria-label',`Inserir ${a.upper}`);b.addEventListener('mousedown',e=>e.preventDefault());b.addEventListener('click',()=>{editor.focus();document.execCommand('insertText',false,a.upper);sync();});palette.append(b);}
    function selected(){const s=getSelection();if(!s?.rangeCount)return [];const r=s.getRangeAt(0);return [...editor.querySelectorAll('p,h2,h3,blockquote,li')].filter(n=>r.intersectsNode(n));}
    function sync(){v.blocks=D.parseDOM(editor);v.blocks.forEach(b=>{if(!b.direction)b.direction=editor.dataset.study==='ltr'?'ltr':'rtl';});v.chapters=D.chapters(v.blocks);changed();}
    toolbar.querySelector('[data-peregrini-direction]').onclick=()=>{const next=editor.dataset.study==='rtl'?'ltr':'rtl';editor.dataset.study=next;editor.dir=next;v.direction=next;editor.querySelectorAll('p,h2,h3,blockquote,li').forEach(n=>n.dir=next);sync();};
    toolbar.querySelector('[data-peregrini-initial]').onclick=()=>{for(const n of selected())n.classList.toggle('initial-illuminated');sync();};
    toolbar.querySelector('[data-peregrini-style]').onchange=e=>{document.execCommand('formatBlock',false,e.target.value);sync();};
    for(const [cmd,label] of [['bold','Negrito'],['italic','Itálico'],['underline','Sublinhado'],['strikeThrough','Tachado'],['justifyCenter','Centralizar'],['justifyFull','Justificar'],['undo','Desfazer'],['redo','Refazer']]){const b=document.createElement('button');b.type='button';b.textContent=label;b.addEventListener('mousedown',e=>e.preventDefault());b.onclick=()=>{editor.focus();document.execCommand(cmd,false,null);sync();};toolbar.append(b);}
    editor.addEventListener('input',sync);editor.addEventListener('blur',sync);
    editor.addEventListener('paste',e=>{e.preventDefault();const html=e.clipboardData.getData('text/html'),plain=e.clipboardData.getData('text/plain');let blocks;if(html){const dom=new DOMParser().parseFromString(html,'text/html');blocks=D.parseDOM(dom.body);}else blocks=plain.split(/\n\s*\n/).map(text=>({tag:'p',direction:editor.dataset.study,runs:[{text}]}));document.execCommand('insertHTML',false,D.render(blocks));sync();});
    return {sync};
  };
})(typeof window!=='undefined'?window:{});
