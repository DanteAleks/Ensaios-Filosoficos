(function(root){
'use strict';
async function digest(text){return Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text))),b=>b.toString(16).padStart(2,'0')).join('');}
async function check(hash,fetcher=fetch){const response=await fetcher('../publication.json?t='+Date.now(),{cache:'no-store',credentials:'omit',signal:AbortSignal.timeout(12000)});if(!response.ok)throw Error('A confirmação ainda não está disponível.');const result=await response.json();return result.catalogHash===hash;}
const api={digest,check};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PeregriniPublication=api;
})(typeof window!=='undefined'?window:{});
