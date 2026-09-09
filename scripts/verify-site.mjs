import fs from 'node:fs';
import path from 'node:path';
const root=path.resolve('dist'),errors=[];
const required=[
  'index.html',
  'peregrini/index.html',
  'fonts.css',
  'peregrini-language.js',
  'fonts/PalavraPeregriniDisplay-Regular.woff2',
  'fonts/PalavraPeregriniTexto-Regular.woff2',
  'fonts/PalavraPeregriniIluminada-Regular.woff2'
];
for(const relative of required)if(!fs.existsSync(path.join(root,relative)))errors.push('Recurso obrigatório ausente: '+relative);
function scan(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,entry.name);if(entry.isDirectory())scan(file);else if(entry.name.endsWith('.html')){const html=fs.readFileSync(file,'utf8');for(const [,ref] of html.matchAll(/(?:src|href)="([^"]+)"/g)){if(/^(?:[a-z]+:|\/\/|#)/i.test(ref))continue;let local=ref.split(/[?#]/)[0];if(!local)continue;const target=path.resolve(path.dirname(file),local);if(!fs.existsSync(target))errors.push(path.relative(root,file)+': '+ref);}}}}
scan(root);
if(errors.length)throw Error('Arquivos necessários ausentes:\n'+errors.join('\n'));
console.log('Páginas e recursos locais verificados.');
