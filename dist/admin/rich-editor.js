(()=>{
  'use strict';
  const D=window.PeregriniDocument;
  const fontFaces={
    'peregrini-text':'Palavra Peregrini Texto',
    'peregrini-display':'Palavra Peregrini Display',
    'peregrini-iluminada':'Palavra Peregrini Iluminada'
  };
  window.mountDocumentEditor=(host,v,changed)=>{
    host.innerHTML='<div class="document-toolbar" role="toolbar" aria-label="Formatação do texto"><label>Estilo <select data-style><option value="p">Parágrafo</option><option value="h2">Título de capítulo</option><option value="h3">Subtítulo</option><option value="blockquote">Citação</option></select></label><label>Fonte do trecho <select data-font><option value="">Padrão do leitor</option><option value="peregrini-text">Palavra Peregrini · Texto</option><option value="peregrini-display">Palavra Peregrini · Display</option><option value="peregrini-iluminada">Palavra Peregrini · Iluminada</option></select></label></div><div class="document-editor" contenteditable="true" role="textbox" aria-label="Documento da obra" aria-multiline="true" spellcheck="true"></div><p class="help">Escreva ou cole seu texto. Use títulos para criar o sumário automaticamente. As três tipografias Palavra Peregrini podem ser aplicadas a qualquer seleção; imagens e tabelas não são importadas.</p>';
    const toolbar=host.firstElementChild,editor=host.querySelector('.document-editor');editor.innerHTML=D.render(D.fromVersion(v));let saved=null;
    function selectedBlocks(){const selection=window.getSelection();if(!selection?.rangeCount)return [];const range=selection.getRangeAt(0);return [...editor.querySelectorAll('p,h2,h3,blockquote,li')].filter(node=>range.intersectsNode(node));}
    function align(value){restore();let nodes=selectedBlocks();if(!nodes.length){document.execCommand('formatBlock',false,'p');nodes=selectedBlocks();}for(const node of nodes){node.style.removeProperty('text-align');node.removeAttribute('align');for(const c of [...node.classList])if(c.startsWith('align-'))node.classList.remove(c);node.classList.add('align-'+value);}}
    function remember(){const selection=window.getSelection();if(selection?.rangeCount&&editor.contains(selection.anchorNode))saved=selection.getRangeAt(0).cloneRange();}
    function restore(){editor.focus();if(saved&&editor.contains(saved.startContainer)){const selection=window.getSelection();selection.removeAllRanges();selection.addRange(saved);}}
    function sync(){v.blocks=D.parseDOM(editor);v.chapters=D.chapters(v.blocks);changed();}
    for(const [cmd,label]of [['bold','Negrito'],['italic','Itálico'],['underline','Sublinhado'],['strikeThrough','Tachado'],['justifyLeft','À esquerda'],['justifyCenter','Centralizar'],['justifyRight','À direita'],['justifyFull','Justificar'],['insertUnorderedList','Marcadores'],['insertOrderedList','Numerar'],['undo','Desfazer'],['redo','Refazer'],['removeFormat','Limpar formato']]){
      const button=document.createElement('button');button.type='button';button.textContent=label;button.onmousedown=event=>event.preventDefault();button.onclick=()=>{restore();const alignment={justifyLeft:'left',justifyCenter:'center',justifyRight:'right',justifyFull:'justify'}[cmd];if(alignment)align(alignment);else document.execCommand(cmd,false,null);sync();remember();};toolbar.append(button);
    }
    toolbar.querySelector('[data-style]').onchange=event=>{restore();document.execCommand('formatBlock',false,event.target.value);sync();remember();};
    toolbar.querySelector('[data-font]').onchange=event=>{const value=event.target.value;if(!value)return;restore();document.execCommand('fontName',false,fontFaces[value]);sync();remember();};
    editor.addEventListener('input',sync);editor.addEventListener('keyup',remember);editor.addEventListener('mouseup',remember);editor.addEventListener('blur',remember);editor.addEventListener('touchend',remember);toolbar.addEventListener('pointerdown',remember);
    editor.addEventListener('paste',event=>{event.preventDefault();const html=event.clipboardData.getData('text/html'),plain=event.clipboardData.getData('text/plain');let blocks;if(html){const dom=new DOMParser().parseFromString(html,'text/html');blocks=D.parseDOM(dom.body);}else blocks=plain.split(/\n\s*\n/).map(text=>({tag:'p',runs:[{text}]}));document.execCommand('insertHTML',false,D.render(blocks));sync();remember();});
    return {sync};
  };
})();
