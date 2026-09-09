(function(root){
  'use strict';
  const loader=document.currentScript;
  const source=loader?.dataset.mathjaxSrc||'./vendor/mathjax/tex-svg-full.js';
  const automatic=loader?.hasAttribute('data-auto')||false;
  const pattern=/\\\([\s\S]+?\\\)|\\\[[\s\S]+?\\\]|\$\$[\s\S]+?\$\$|(?:^|[^\\$])\$[^$\n]+\$/m;
  let loading;

  function nodes(value){
    const list=Array.isArray(value)?value:[value||document.body];
    return list.filter(node=>node&&node.nodeType===1);
  }
  function contains(value){return nodes(value).some(node=>pattern.test(node.textContent||''));}
  function configure(){
    if(root.MathJax?.typesetPromise)return;
    root.MathJax={
      tex:{
        inlineMath:[['\\(','\\)'],['$','$']],
        displayMath:[['\\[','\\]'],['$$','$$']],
        processEscapes:true,
        processEnvironments:true
      },
      svg:{fontCache:'local'},
      options:{
        skipHtmlTags:['script','noscript','style','textarea','pre','code'],
        ignoreHtmlClass:'tex2jax_ignore',
        processHtmlClass:'tex2jax_process'
      },
      startup:{typeset:false}
    };
  }
  function load(){
    if(root.MathJax?.typesetPromise)return Promise.resolve(root.MathJax);
    if(loading)return loading;
    configure();
    loading=new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=new URL(source,document.baseURI).href;
      script.async=true;
      script.onload=()=>Promise.resolve(root.MathJax.startup?.promise).then(()=>resolve(root.MathJax),reject);
      script.onerror=()=>reject(new Error('Não foi possível carregar o renderizador de fórmulas.'));
      document.head.append(script);
    });
    return loading;
  }
  async function typeset(value){
    const targets=nodes(value);
    if(!targets.length||!contains(targets))return false;
    const math=await load();
    if(math.typesetClear)math.typesetClear(targets);
    await math.typesetPromise(targets);
    return true;
  }
  root.PeregriniMath={contains,load,typeset};
  if(automatic){
    const run=()=>typeset(document.querySelector('main')||document.body).catch(error=>console.error(error));
    if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  }
})(typeof window!=='undefined'?window:{});
