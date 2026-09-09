(function(root){
  'use strict';
  const P=root.PeregriniLanguage;
  const E=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  root.mountVocabularyEditor=function(host,data,changed){
    let entries=P.settings(data.peregrini).lexicon,editing=-1;
    host.innerHTML=`<form id="vocabulary-form"><fieldset id="vocabulary-fields"><legend>Adicionar ou editar uma palavra</legend>
      <div class="vocabulary-edit-grid"><label>Palavra em Peregrini<input name="term" class="peregrini-term-input" dir="rtl" lang="art-x-peregrini" maxlength="150" autocomplete="off" spellcheck="false" required></label>
      <label>Pronúncia de apoio <span class="optional">(opcional)</span><input name="pronunciation" maxlength="200" placeholder="Como ler a palavra"></label>
      <label>Classe gramatical<select name="partOfSpeech" required><option value="">Escolha uma classe</option>${Object.entries(P.partOfSpeechLabels).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label>
      <label class="full-row">Significado em português<textarea name="meaning" rows="2" maxlength="1500" required></textarea></label>
      <label class="full-row">Exemplo de uso em Peregrini <span class="optional">(opcional)</span><textarea name="example" class="peregrini-term-input" dir="rtl" lang="art-x-peregrini" rows="2" maxlength="1000" spellcheck="false"></textarea></label></div>
      <p class="help">Digite as letras na sequência de leitura. A prévia apresenta a palavra da direita para a esquerda.</p>
      <p class="vocabulary-preview" aria-label="Prévia da palavra"><bdo dir="rtl" class="peregrini-glyph peregrini-rtl" lang="art-x-peregrini"></bdo></p>
      <div class="vocabulary-palette" aria-label="Inserir letra Peregrini"></div>
      <div class="vocabulary-form-actions"><button type="submit" class="primary">Adicionar ao vocabulário</button><button type="button" data-vocabulary-cancel hidden>Cancelar edição</button><button type="button" data-vocabulary-delete hidden class="danger">Remover esta palavra</button></div>
      <p class="help">Depois de adicionar ou editar, use “Publicar alterações” no alto da página para atualizar o site.</p>
    </fieldset></form><p data-vocabulary-notice role="status" aria-live="polite"></p>
    <div class="vocabulary-admin-controls"><label>Pesquisar palavras<input type="search" data-vocabulary-search placeholder="Palavra ou significado"></label><label>Ordem do vocabulário<select data-vocabulary-sort><option value="alphabet">Alfabética Peregrini</option><option value="reverse">Alfabética inversa</option></select></label></div>
    <p data-vocabulary-total role="status" aria-live="polite"></p><ul class="author-vocabulary-list"></ul>`;
    const form=host.querySelector('form'),fields=form.elements;
    const preview=host.querySelector('.vocabulary-preview bdo'),notice=host.querySelector('[data-vocabulary-notice]');
    const submit=form.querySelector('[type=submit]'),cancel=form.querySelector('[data-vocabulary-cancel]'),remove=form.querySelector('[data-vocabulary-delete]');
    const search=host.querySelector('[data-vocabulary-search]'),sort=host.querySelector('[data-vocabulary-sort]');
    let target=fields.term;
    [fields.term,fields.example].forEach(input=>input.addEventListener('focus',()=>{target=input;}));
    function say(message,error=false){notice.textContent=message;notice.classList.toggle('error',error);}
    function drawPreview(){preview.textContent=fields.term.value;}
    fields.term.addEventListener('input',drawPreview);
    const palette=host.querySelector('.vocabulary-palette');
    for(const letter of P.alphabet){
      const pair=document.createElement('span');pair.className='peregrini-letter-pair';
      for(const [glyph,label] of [[letter.upper,'maiúscula'],[letter.lower,'minúscula']]){
        const button=document.createElement('button');button.type='button';button.textContent=glyph;
        button.setAttribute('aria-label',`Inserir ${label} ${glyph} no vocabulário`);
        button.addEventListener('mousedown',e=>e.preventDefault());
        button.onclick=()=>{const start=target.selectionStart??target.value.length,end=target.selectionEnd??start;target.setRangeText(glyph,start,end,'end');target.focus();drawPreview();};
        pair.append(button);
      }
      palette.append(pair);
    }
    function persist(next){
      const setting={...(data.peregrini||{}),lexicon:next};
      if(!P.validate(setting))throw Error('Revise as palavras: cada uma precisa de significado e não pode estar repetida.');
      data.peregrini=setting;entries=next;changed();render();
    }
    function reset(){editing=-1;form.reset();drawPreview();submit.textContent='Adicionar ao vocabulário';cancel.hidden=true;remove.hidden=true;}
    function edit(entry){
      editing=entries.indexOf(entry);
      for(const key of ['term','meaning','pronunciation','example','partOfSpeech'])fields[key].value=entry[key]||'';
      drawPreview();submit.textContent='Guardar edição';cancel.hidden=false;remove.hidden=false;fields.term.focus();
      form.scrollIntoView?.({block:'start',behavior:'smooth'});say('Revise a palavra e clique em “Guardar edição”.');
    }
    function render(){
      const visible=P.filterLexicon(entries,{query:search.value,order:sort.value});
      const list=host.querySelector('.author-vocabulary-list');list.replaceChildren();
      visible.forEach(entry=>{
        const item=document.createElement('li');
        item.innerHTML=`<div><bdo dir="rtl" lang="art-x-peregrini" class="peregrini-glyph peregrini-rtl">${E(entry.term)}</bdo><p>${E(entry.meaning)}</p>${entry.partOfSpeech&&P.partOfSpeechLabels[entry.partOfSpeech]?`<small>${E(P.partOfSpeechLabels[entry.partOfSpeech])}</small>`:''}${entry.pronunciation?`<small>${E(entry.pronunciation)}</small>`:''}</div><div class="vocabulary-item-actions"><button type="button">Editar palavra</button><button type="button" class="danger">Remover palavra</button></div>`;
        item.querySelector('button').onclick=()=>edit(entry);
        item.querySelector('.danger').onclick=()=>{
          if(!confirm('Remover esta palavra do vocabulário? A alteração será publicada somente ao salvar no GitHub.'))return;
          const wasEditing=editing>=0?entries[editing]:null;
          persist(entries.filter(x=>x!==entry));
          if(wasEditing===entry)reset();else editing=entries.indexOf(wasEditing);
          say('Palavra removida do rascunho. Publique para atualizar o site.');
        };
        list.append(item);
      });
      host.querySelector('[data-vocabulary-total]').textContent=`${visible.length} de ${entries.length} palavras`;
      if(!visible.length){const item=document.createElement('li');item.textContent='Nenhuma palavra encontrada.';list.append(item);}
    }
    form.addEventListener('submit',event=>{
      event.preventDefault();
      if(fields['vocabulary-fields']?.disabled||host.querySelector('fieldset').disabled)return;
      if(!form.reportValidity()){say('Preencha a palavra, a classe gramatical e o significado.',true);return;}
      const entry=editing<0?{}:{...entries[editing]};
      for(const key of ['term','meaning','pronunciation','example','partOfSpeech'])entry[key]=fields[key].value.trim();
      const next=entries.slice();
      if(next.some((word,index)=>index!==editing&&P.normalize(word.term)===P.normalize(entry.term))){say('Essa palavra já existe. Use “Editar palavra” para alterar seu significado.',true);return;}
      if(editing<0)next.push(entry);else next[editing]=entry;
      try{persist(next);reset();say('Palavra guardada no rascunho. Use “Publicar alterações” para atualizar o vocabulário.');}catch(error){say(error.message,true);}
    });
    cancel.onclick=()=>{reset();say('Edição cancelada.');};
    remove.onclick=()=>{
      if(editing<0)return;
      if(!confirm('Remover esta palavra do vocabulário? A alteração será publicada somente ao salvar no GitHub.'))return;
      try{persist(entries.filter((_,index)=>index!==editing));reset();say('Palavra removida do rascunho. Publique para atualizar o vocabulário.');}catch(error){say(error.message,true);}
    };
    search.addEventListener('input',render);sort.addEventListener('change',render);
    render();
    return {render};
  };
})(typeof window!=='undefined'?window:{});
