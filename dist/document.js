(function(root){
  'use strict';
  const escape=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const tags=['p','h2','h3','blockquote','li'];
  const fontClasses={
    'peregrini-text':'font-peregrini-text',
    'peregrini-display':'font-peregrini-display',
    'peregrini-iluminada':'font-peregrini-iluminada'
  };
  const allowedFonts=new Set(Object.keys(fontClasses));
  function valid(blocks){
    return Array.isArray(blocks)&&blocks.length<=20000&&blocks.every(b=>b&&tags.includes(b.tag)&&(!b.align||['left','center','right','justify','start'].includes(b.align))&&(!b.direction||['ltr','rtl'].includes(b.direction))&&(!b.initial||b.initial==='illuminated')&&Array.isArray(b.runs)&&b.runs.every(r=>r&&typeof r.text==='string'&&r.text.length<=500000&&(!r.font||allowedFonts.has(r.font))));
  }
  function text(b){return b.runs.map(r=>r.text).join('');}
  function renderRun(r){
    let s=escape(r.text).replace(/\n/g,'<br>');
    for(const [key,tag] of [['bold','strong'],['italic','em'],['underline','u'],['strike','s']])if(r[key]===true)s=`<${tag}>${s}</${tag}>`;
    if(r.font&&fontClasses[r.font])s=`<span class="${fontClasses[r.font]}">${s}</span>`;
    return s;
  }
  // Capitular explícita em um span: mantém a primeira letra na mesma palavra,
  // inclusive em RTL, sem o float que a separava do restante do parágrafo.
  function renderRuns(runs,initial){
    let pending=initial;
    return runs.map(r=>{
      if(!pending||!r.text||!r.text.trim())return renderRun(r);
      const match=/^(\s*)([\s\S])([\s\S]*)$/u.exec(r.text);
      if(!match)return renderRun(r);
      pending=false;
      const before=match[1],first=match[2],after=match[3];
      return `${renderRun({...r,text:before})}<span class="initial-illuminated-letter">${renderRun({...r,text:first})}</span>${renderRun({...r,text:after})}`;
    }).join('');
  }
  function render(blocks){
    if(!valid(blocks))throw Error('Documento com formatação inválida.');
    return blocks.map((b,i)=>{
      const html=renderRuns(b.runs,b.initial==='illuminated');
      let tag=b.tag;
      let attrs=` class="doc-block align-${b.align||'left'}${b.initial==='illuminated'?' initial-illuminated':''}"`;
      if(b.direction)attrs+=` dir="${b.direction}"`;
      if(tag.startsWith('h'))attrs+=` id="${escape(b.id||'secao-'+(i+1))}"`;
      else if(i===0)attrs+=' id="introducao"';
      const node=`<${tag}${attrs}>${html||'<br>'}</${tag}>`;
      return tag==='li'?`<${b.ordered?'ol':'ul'}${b.ordered?` start="${Number.isInteger(b.number)&&b.number>0?b.number:1}"`:''}>${node}</${b.ordered?'ol':'ul'}>`:node;
    }).join('');
  }
  function fromVersion(v){
    if(v.blocks)return v.blocks;
    const out=[];
    function visit(c,tag){
      out.push({tag,id:c.id,runs:[{text:c.title}]});
      for(const p of c.paragraphs)out.push({tag:'p',runs:[{text:p}]});
      (c.subchapters||[]).forEach(s=>visit(s,'h3'));
    }
    v.chapters.forEach(c=>visit(c,'h2'));
    return out;
  }
  function chapters(blocks){
    const out=[];let current,sub;
    for(const [i,b] of blocks.entries()){
      if(b.tag==='h2'||b.tag==='h3'){
        const c={id:b.id||'secao-'+(i+1),title:text(b)||'Sem título',paragraphs:[],subchapters:[]};
        if(b.tag==='h2'||!current){out.push(c);current=c;sub=null;}
        else{current.subchapters.push(c);sub=c;}
      }else{
        if(!current){current={id:'introducao',title:'Texto',paragraphs:[],subchapters:[]};out.push(current);}
        (sub||current).paragraphs.push(text(b));
      }
    }
    return out;
  }
  // Lê somente propriedades textuais e de estilo conhecidas; HTML colado,
  // scripts, URLs e manipuladores nunca são persistidos.
  function parseDOM(container){
    let blocks=[],inline=[];
    const blocked=new Set(['SCRIPT','STYLE','IFRAME','OBJECT','SVG','IMG']);
    function fontFrom(node){
      const classes=node.classList?[...node.classList]:[];
      for(const [name,className] of Object.entries(fontClasses))if(classes.includes(className))return name;
      const face=(node.getAttribute?.('face')||'').toLowerCase();
      const family=(node.style?.fontFamily||'').toLowerCase();
      const value=`${face} ${family}`;
      if(value.includes('palavra peregrini iluminada'))return 'peregrini-iluminada';
      if(value.includes('palavra peregrini display'))return 'peregrini-display';
      if(value.includes('palavra peregrini texto'))return 'peregrini-text';
      return undefined;
    }
    function runs(node,marks={}){
      if(node.nodeType===3)return [{text:node.nodeValue,...marks}];
      if(node.nodeType!==1||blocked.has(node.tagName))return [];
      if(node.tagName==='BR')return [{text:'\n',...marks}];
      const m={...marks},s=node.style||{};
      if(['B','STRONG'].includes(node.tagName)||s.fontWeight==='bold'||Number(s.fontWeight)>=600)m.bold=true;
      if(['I','EM'].includes(node.tagName)||s.fontStyle==='italic')m.italic=true;
      if(node.tagName==='U'||(s.textDecoration+' '+s.textDecorationLine).includes('underline'))m.underline=true;
      if(['S','STRIKE'].includes(node.tagName)||(s.textDecoration+' '+s.textDecorationLine).includes('line-through'))m.strike=true;
      const font=fontFrom(node);if(font)m.font=font;
      return [...node.childNodes].flatMap(n=>runs(n,m));
    }
    function flush(){if(inline.some(r=>r.text.trim()))blocks.push({tag:'p',runs:inline});inline=[];}
    function walk(node){
      if(node.nodeType===3){inline.push(...runs(node));return;}
      if(node.nodeType!==1||blocked.has(node.tagName))return;
      const name=node.tagName.toLowerCase();
      if(name==='ul'||name==='ol'){
        flush();let n=Number(node.getAttribute('start'))||1;
        for(const li of node.children)if(li.tagName==='LI')blocks.push({tag:'li',ordered:name==='ol',number:n++,runs:runs(li)});
        return;
      }
      if(['p','div','h1','h2','h3','h4','blockquote','li'].includes(name)){
        flush();
        if(name==='div'&&node.querySelector('p,div,h1,h2,h3,ul,ol')){[...node.childNodes].forEach(walk);flush();return;}
        let tag=name==='div'?'p':name==='h1'?'h2':name==='h4'?'h3':name;
        if(/MsoHeading1/.test(node.className))tag='h2';
        if(/MsoHeading2/.test(node.className))tag='h3';
        const align=['left','center','right','justify'].includes(node.style?.textAlign)?node.style.textAlign:[...node.classList].find(c=>c.startsWith('align-'))?.slice(6)||'left';
        const b={tag,align,runs:runs(node)};
        if(node.id&&/^[a-z0-9-]+$/.test(node.id))b.id=node.id;
        if(node.dir==='rtl'||node.dir==='ltr')b.direction=node.dir;
        if(node.classList.contains('initial-illuminated'))b.initial='illuminated';
        blocks.push(b);
      }else inline.push(...runs(node));
    }
    [...container.childNodes].forEach(walk);flush();
    if(!blocks.length)blocks=[{tag:'p',runs:[{text:''}]}];
    const used=new Set(blocks[0]&&!blocks[0].tag.startsWith('h')?['introducao']:[]);
    blocks.forEach((b,i)=>{if(b.tag.startsWith('h')){let id=/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(b.id||'')?b.id:'secao-'+(i+1);while(used.has(id))id+='-2';b.id=id;used.add(id);}});
    return blocks;
  }
  const api={valid,render,fromVersion,chapters,parseDOM,text};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PeregriniDocument=api;
})(typeof window!=='undefined'?window:{});
