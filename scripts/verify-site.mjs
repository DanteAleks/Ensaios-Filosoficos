import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist'),errors=[];
const required=[
  'index.html',
  'peregrini/index.html',
  'peregrini/via.html',
  'peregrini/idioma.html',
  'peregrini-codification.js',
  'peregrini-codification.css',
  'peregrini-flourish.svg',
  'vocabulary.js',
  'math-renderer.js',
  'vendor/mathjax/tex-svg-full.js',
  'vendor/mathjax/LICENSE.txt',
  'admin/vocabulary-editor.js',
  'fonts.css',
  'peregrini-language.js',
  'fonts/PalavraPeregriniDisplay-Regular.woff2',
  'fonts/PalavraPeregriniTexto-Regular.woff2',
  'fonts/PalavraPeregriniIluminada-Regular.woff2'
];
for(const relative of required)if(!fs.existsSync(path.join(root,relative)))errors.push('Recurso obrigatório ausente: '+relative);
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else if(entry.name.endsWith('.html')){const html=fs.readFileSync(file,'utf8');for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(/^(?:[a-z]+:|\/\/|#)/i.test(ref))continue;let local=ref.split(/[?#]/)[0];if(!local)continue;const target=path.resolve(path.dirname(file),local);if(!fs.existsSync(target))errors.push(path.relative(root,file)+': '+ref);}}}}
scan(root);
const home=fs.readFileSync(path.join(root,'index.html'),'utf8');
if(home.includes('{{PEREGRINI_ENTRY_WORD}}'))errors.push('O botão Peregrini ainda contém uma variável não substituída.');
for(const name of ['via.html','index.html','idioma.html']){
  const html=fs.readFileSync(path.join(root,'peregrini',name),'utf8');
  if(!html.includes('data-peregrini-codification="portuguese"'))errors.push('Codificação Peregrini ausente: '+name);
}
if(errors.length)throw Error('Arquivos necessários ausentes:\n'+errors.join('\n'));
console.log('Páginas e recursos locais verificados.');
