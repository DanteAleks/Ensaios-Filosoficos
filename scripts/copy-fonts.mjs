import fs from 'node:fs';
import path from 'node:path';

export function copyFonts(root) {
  const source = path.join(root, 'Fonts/Palavra-Peregrini-Colecao-v1.0');
  const target = path.join(root, 'dist/fonts');
  const families = ['Texto', 'Display', 'Iluminada'];
  // Small catalogue tests copy only the generator and its prior dist output.
  // In the real repository the tracked Fonts directory is present; when it is
  // absent, keep an already-generated dist/fonts directory intact.
  if (!fs.existsSync(source)) return;
  // Check every required input before touching the published directory.
  for (const family of families) {
    const file = path.join(source, `fontes/woff2/PalavraPeregrini${family}-Regular.woff2`);
    if (!fs.existsSync(file) || fs.readFileSync(file).subarray(0, 4).toString() !== 'wOF2') {
      throw new Error(`Fonte WOFF2 ausente ou inválida: ${path.relative(root, file)}. Preserve a pasta Fonts do repositório.`);
    }
  }
  fs.mkdirSync(target, { recursive: true });
  for (const family of families) {
    const name = `PalavraPeregrini${family}-Regular.woff2`;
    fs.copyFileSync(path.join(source, 'fontes/woff2', name), path.join(target, name));
  }
  fs.cpSync(path.join(source, 'licencas'), path.join(target, 'licencas'), { recursive: true });
  fs.copyFileSync(path.join(source, 'LEIA-ME.txt'), path.join(target, 'LEIA-ME.txt'));
}
