(function(root){
  'use strict';
  const D=root.PeregriniDocument;
  const blockSelector='p,h2,h3,blockquote,li';
  root.mountPeregriniEditor=function(host,v,changed){
    host.innerHTML='<div class="peregrini-toolbar" role="toolbar" aria-label="Ferramentas de escrita Peregrini"><label>Estilo <select data-peregrini-style><option value="p">Parágrafo</option><option value="h2">Título</option><option value="h3">Subtítulo</option><option value="blockquote">Citação</option></select></label><button type="button" data-peregrini-direction>Direção: direita → esquerda</button><button type="button" data-peregrini-initial>Capitular iluminada</button><span class="peregrini-direction-status" data-peregrini-direction-status role="status" aria-live="polite">Escrita visual da direita para a esquerda</span><div class="peregrini-palette" aria-label="Letras Peregrini"></div></div><div class="document-editor peregrini-document" contenteditable="true" role="textbox" aria-label="Documento original em Peregrini" aria-multiline="true" spellcheck="false"></div><p class="help">Digite na ordem lógica normal; a composição visual da escrita Peregrini é feita da direita para a esquerda. Não inverta manualmente as palavras. A paleta oferece cada letra em maiúscula e minúscula.</p>';
    const toolbar=host.querySelector('.peregrini-toolbar'),editor=host.querySelector('.document-editor'),palette=host.querySelector('.peregrini-palette'),directionButton=toolbar.querySelector('[data-peregrini-direction]'),directionStatus=toolbar.querySelector('[data-peregrini-direction-status]');
    editor.innerHTML=D.render(D.fromVersion(v));

    function updateDirectionUI(next){
      editor.dataset.study=next;
      editor.setAttribute('dir',next);
      editor.style.direction=next;
      editor.style.unicodeBidi=next==='rtl'?'isolate-override':'normal';
      editor.querySelectorAll(blockSelector).forEach(node=>{
        node.setAttribute('dir',next);
        node.style.direction=next;
        node.style.unicodeBidi=next==='rtl'?'isolate-override':'normal';
      });
      directionButton.textContent=next==='rtl'?'Direção: direita → esquerda':'Direção: esquerda → direita';
      directionStatus.textContent=next==='rtl'?'Escrita visual da direita para a esquerda':'Escrita visual da esquerda para a direita';
    }
    updateDirectionUI(v.direction==='ltr'?'ltr':'rtl');

    const alphabet=root.PeregriniLanguage?.alphabet||[];
    if(alphabet.length){
      const heading=document.createElement('span');heading.className='palette-label';heading.textContent='Letras';palette.append(heading);
      for(const a of alphabet){
        const group=document.createElement('span');group.className='peregrini-letter-pair';group.title=`${a.upper} / ${a.lower} · ${a.sound}`;
        for(const [glyph,caseName] of [[a.upper,'maiúscula'],[a.lower,'minúscula']]){
          const button=document.createElement('button');button.type='button';button.textContent=glyph;button.dataset.case=caseName;button.title=`Inserir ${caseName}: ${glyph}`;button.setAttribute('aria-label',`Inserir ${caseName} ${glyph}`);button.addEventListener('mousedown',event=>event.preventDefault());button.addEventListener('click',()=>insertGlyph(glyph));group.append(button);
        }
        palette.append(group);
      }
    }

    function selected(){
      const selection=window.getSelection?.();
      if(!selection?.rangeCount)return [];
      const range=selection.getRangeAt(0);
      return [...editor.querySelectorAll(blockSelector)].filter(node=>range.intersectsNode(node));
    }
    function insertGlyph(glyph){
      const selection=window.getSelection?.();
      let range;
      if(selection?.rangeCount&&editor.contains(selection.anchorNode))range=selection.getRangeAt(0);
      else{
        range=document.createRange();
        // Sem seleção, insira no fim do último bloco, nunca como texto solto
        // entre o editor e o primeiro parágrafo.
        const last=editor.querySelectorAll(blockSelector).item(editor.querySelectorAll(blockSelector).length-1)||editor;
        range.selectNodeContents(last);range.collapse(false);
      }
      editor.focus();
      range.deleteContents();
      const node=document.createTextNode(glyph);
      range.insertNode(node);
      range.setStartAfter(node);range.collapse(true);
      if(selection){selection.removeAllRanges();selection.addRange(range);}
      sync();
    }
    function sync(){
      const direction=editor.dataset.study==='ltr'?'ltr':'rtl';
      v.direction=direction;
      v.blocks=D.parseDOM(editor);
      // Cada bloco recebe explicitamente o modo atual; isso evita que um
      // heading recém-criado herde LTR e quebre a ordem visual da palavra.
      v.blocks.forEach(block=>{block.direction=direction;});
      v.chapters=D.chapters(v.blocks);
      changed();
    }
    directionButton.onclick=()=>{const next=editor.dataset.study==='rtl'?'ltr':'rtl';updateDirectionUI(next);sync();};
    toolbar.querySelector('[data-peregrini-initial]').onclick=()=>{for(const node of selected())node.classList.toggle('initial-illuminated');sync();};
    toolbar.querySelector('[data-peregrini-style]').onchange=event=>{editor.focus();document.execCommand('formatBlock',false,event.target.value);sync();};
    for(const [cmd,label] of [['bold','Negrito'],['italic','Itálico'],['underline','Sublinhado'],['strikeThrough','Tachado'],['justifyCenter','Centralizar'],['justifyFull','Justificar'],['undo','Desfazer'],['redo','Refazer']]){
      const button=document.createElement('button');button.type='button';button.textContent=label;button.addEventListener('mousedown',event=>event.preventDefault());button.onclick=()=>{editor.focus();document.execCommand(cmd,false,null);sync();};toolbar.append(button);
    }
    editor.addEventListener('input',sync);editor.addEventListener('blur',sync);
    editor.addEventListener('paste',event=>{
      event.preventDefault();
      const html=event.clipboardData.getData('text/html'),plain=event.clipboardData.getData('text/plain');
      let blocks;
      if(html){const dom=new DOMParser().parseFromString(html,'text/html');blocks=D.parseDOM(dom.body);}
      else blocks=plain.split(/\n\s*\n/).map(text=>({tag:'p',direction:editor.dataset.study,runs:[{text}]}));
      blocks.forEach(block=>{block.direction=editor.dataset.study;});
      document.execCommand('insertHTML',false,D.render(blocks));sync();
    });
    return {sync};
  };
})(typeof window!=='undefined'?window:{});
