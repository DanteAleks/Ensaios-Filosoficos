(function(root){
  'use strict';
  const OWNER='DanteAleks',REPO='Ensaios-Filosoficos',BASE=`/repos/${OWNER}/${REPO}`;
  function decode(text){return new TextDecoder('utf-8',{fatal:true}).decode(Uint8Array.from(atob(text.replace(/\s/g,'')),c=>c.charCodeAt(0)));}
  function encode(text){const bytes=new TextEncoder().encode(text);let binary='';for(let i=0;i<bytes.length;i+=8192)binary+=String.fromCharCode(...bytes.subarray(i,i+8192));return btoa(binary);}
  function createClient(fetcher=fetch){
    let token='',branch='',sha='',connected=false;
    async function request(path,options={}){
      const response=await fetcher(`https://api.github.com${path}`,{...options,redirect:'error',credentials:'omit',cache:'no-store',headers:{Accept:'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28',Authorization:`Bearer ${token}`,...(options.body?{'Content-Type':'application/json'}:{})},signal:AbortSignal.timeout(30000)});
      if(!response.ok){const err=new Error(response.status===401?'A chave expirou ou não foi reconhecida. Conecte novamente.':response.status===403?'O GitHub não autorizou a operação. Confira o acesso da chave a este repositório e a permissão Contents: Read and write.':response.status===409?'O acervo foi alterado em outra sessão. Baixe suas alterações antes de recarregar.':response.status===422?'O GitHub recusou a gravação. Confira as regras da branch e recarregue o acervo antes de tentar novamente.':`Não foi possível acessar o GitHub (erro ${response.status}).`);err.status=response.status;throw err;}
      return response.json();
    }
    async function read(){const file=await request(`${BASE}/contents/content/obras.json?ref=${encodeURIComponent(branch)}`);if(file.encoding!=='base64'||!file.content)throw new Error('O catálogo retornado não pôde ser lido.');return {sha:file.sha,text:decode(file.content)};}
    async function owner(){const user=await request('/user');if(user.login!==OWNER)throw new Error(`Este editor aceita apenas a conta ${OWNER}.`);return user;}
    return {
      async connect(value){token=value.trim();connected=false;sha='';branch='';if(!token)throw new Error('Informe sua chave de acesso.');try{await owner();const repo=await request(BASE);if(repo.owner?.login!==OWNER||repo.name!==REPO)throw new Error('Repositório inesperado.');branch=repo.default_branch;const file=await read();sha=file.sha;connected=true;return file;}catch(e){token='';throw e;}},
      async reload(validate){if(!connected)throw new Error('Conecte sua conta primeiro.');const file=await read();validate(file.text);sha=file.sha;return file;},
      async save(text){if(!connected||!token)throw new Error('Conecte sua conta primeiro.');await owner();const latest=await read();if(latest.sha!==sha){const e=new Error('Há uma versão mais recente no GitHub. Baixe suas alterações e recarregue para não sobrescrever o outro trabalho.');e.status=409;throw e;}
        try{const result=await request(`${BASE}/contents/content/obras.json`,{method:'PUT',body:JSON.stringify({message:'Atualizar textos pelo editor Peregrini',content:encode(text),sha,branch})});sha=result.content.sha;return {commit:result.commit.sha,url:result.commit.html_url};}
        catch(e){if(!e.status){try{const remote=await read();if(remote.text===text){sha=remote.sha;return {commit:null,url:`https://github.com/${OWNER}/${REPO}/commits/${encodeURIComponent(branch)}/content/obras.json`};}}catch{}throw new Error('A conexão foi interrompida e não foi possível confirmar a gravação. Preserve suas alterações e confira o GitHub antes de tentar novamente.');}throw e;}
      },
      disconnect(){token='';branch='';sha='';connected=false;}
    };
  }
  const api={createClient,encode,decode};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PeregriniEditorGitHub=api;
})(typeof window!=='undefined'?window:{});
