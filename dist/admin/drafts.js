(function(root){
'use strict';
const KEY='peregrini:author-draft:v1';
function create(storage){return {
 save(data,base){const value={version:1,data,base,savedAt:new Date().toISOString()};storage.setItem(KEY,JSON.stringify(value));return value;},
 read(){const raw=storage.getItem(KEY);if(!raw)return null;const d=JSON.parse(raw);if(d.version!==1||!d.data||!d.base||typeof d.savedAt!=='string')throw Error('Rascunho local inválido.');return d;},
 remove(){storage.removeItem(KEY);},
 matches(d,base){return JSON.stringify(d.base)===JSON.stringify(base);}
};}
const api={create};if(typeof module!=='undefined'&&module.exports)module.exports=api;else root.PeregriniDrafts=api;
})(typeof window!=='undefined'?window:{});
