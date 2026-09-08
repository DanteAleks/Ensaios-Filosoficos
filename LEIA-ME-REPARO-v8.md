# Reparo da atualização do Editor Peregrini

O último envio deixou no GitHub a nova tela do editor, mas não levou todos os arquivos dos quais ela depende. Por isso o editor não carregava e o processo do Pages não conseguia gerar o site.

Extraia este ZIP e envie os arquivos mantendo exatamente as pastas e os nomes. Na página do repositório, use **Add file → Upload files**, arraste o conteúdo extraído (não o ZIP) e faça um commit na branch `main`.

Arquivos restaurados:

- `scripts/read-catalog.mjs`, usado pelo gerador;
- os módulos públicos de leitura, preferências, reações e contato;
- `dist/admin/drafts.js`, `publication.js` e `inbox.js`, usados pela área do autor.

Depois do commit, abra **Actions → Atualizar site Peregrini**. Se aparecer o botão **Run workflow**, escolha `main` e execute. Espere os trabalhos `build` e `deploy` terminarem com marca verde. Só então recarregue o site com `Ctrl+F5` (ou `⌘+Shift+R`).

O catálogo atual continua sendo o que já está no GitHub; este reparo não substitui `content/obras.json`.
