(function (root) {
  'use strict';
  const clone = value => JSON.parse(JSON.stringify(value));
  const slug = text => text.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'texto';
  function unique(text, taken) { const base=slug(text); let id=base, i=2; while(taken.includes(id)) id=`${base}-${i++}`; return id; }
  const paragraphs = text => text.trim() ? text.trim().split(/\n\s*\n/).map(p=>p.trim()) : [];
  function assert(ok,message) { if (!ok) throw new Error(message); }
  function validate(data) {
    assert(data && typeof data.author==='string' && Array.isArray(data.works),'O arquivo precisa conter o autor e a lista de obras.');
    const workIDs=new Set();
    for(const w of data.works){
      assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(w.id)&&!workIDs.has(w.id),'Uma obra tem endereço inválido ou repetido.');workIDs.add(w.id);
      assert(typeof w.title==='string'&&w.title.trim(),'Dê um título a cada obra.');
      assert(typeof w.kind==='string'&&typeof w.summary==='string',`Revise o tipo e o resumo de ${w.title}.`);
      assert(Array.isArray(w.variants)&&w.variants.length,`Adicione uma apresentação a ${w.title}.`);
      const formats=new Set();
      for(const v of w.variants){
        assert(['sintetico','didatico'].includes(v.id)&&!formats.has(v.id),`Apresentação repetida ou inválida em ${w.title}.`);formats.add(v.id);
        assert(['andamento','finalizado'].includes(v.status),'Selecione o estado da obra.');
        assert(['trecho','integral','demonstracao'].includes(v.availability),'Selecione o conteúdo disponível.');
        assert(v.updated===null||(typeof v.updated==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(v.updated)&&!isNaN(Date.parse(v.updated))&&new Date(v.updated).toISOString().slice(0,10)===v.updated),'A data de atualização é inválida.');
        assert(Array.isArray(v.chapters)&&v.chapters.length,`Adicione um capítulo à versão ${v.id} de ${w.title}.`);
        const ids=new Set();
        function check(nodes,depth){assert(depth<=1,'Use capítulos e um nível de subcapítulos.');for(const c of nodes){assert(typeof c.id==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(c.id)&&!ids.has(c.id),'Endereço de capítulo repetido ou inválido.');ids.add(c.id);assert(typeof c.title==='string'&&c.title.trim(),`Há um capítulo sem título em ${w.title}.`);assert(Array.isArray(c.paragraphs)&&c.paragraphs.every(p=>typeof p==='string'),'Texto de capítulo inválido.');if(c.subchapters!==undefined){assert(Array.isArray(c.subchapters),'Subcapítulos inválidos.');check(c.subchapters,depth+1);}}}
        check(v.chapters,0);
      }
    }
    return data;
  }
  function chapter(version, title='Novo capítulo') { const ids=version.chapters.flatMap(c=>[c.id,...(c.subchapters||[]).map(s=>s.id)]);return {id:unique(title,ids),title,paragraphs:[],subchapters:[]}; }
  function variant(id) { return {id,status:'andamento',availability:'trecho',updated:null,last:'',next:'',chapters:[{id:'capitulo-1',title:'Primeiro capítulo',paragraphs:[],subchapters:[]}]}; }
  function newWork(data,title){return {id:unique(title,data.works.map(w=>w.id)),title,kind:'Ensaio',summary:'',variants:[variant('didatico')]};}
  // Timestamp only presentations whose content/metadata changed, preserving untouched works.
  function prepare(data,base,date){const next=clone(data);for(const w of next.works)for(const v of w.variants){const oldW=base.works.find(x=>x.id===w.id),oldV=oldW?.variants.find(x=>x.id===v.id);const a=clone(v);delete a.updated;const b=oldV?clone(oldV):null;if(b)delete b.updated;if(!oldW||w.title!==oldW.title||w.summary!==oldW.summary||w.kind!==oldW.kind||JSON.stringify(a)!==JSON.stringify(b))v.updated=date;}validate(next);return next;}
  function parse(source) {
    const data=JSON.parse(source);
    const tokens=source.match(/"(?:\\.|[^"\\])*"|[{}\[\]:,]|[^\s{}\[\]:,]+/g)||[], stack=[];
    for(let i=0;i<tokens.length;i++){const t=tokens[i];if(t==='{')stack.push(new Set());else if(t==='[')stack.push(null);else if(t==='}'||t===']')stack.pop();else if(t.startsWith('"')&&tokens[i+1]===':'){const key=JSON.parse(t),keys=stack.at(-1);if(keys.has(key))throw new Error(`O catálogo tem o campo ${key} repetido. Corrija-o antes de abrir o editor.`);keys.add(key);}}
    return data;
  }
  const model={parse,clone,unique,paragraphs,validate,chapter,variant,newWork,prepare};
  if(typeof module!=='undefined'&&module.exports)module.exports=model;else root.PeregriniEditorModel=model;
})(typeof window!=='undefined'?window:{});
