# Reparo da publicação Peregrini — v9

O log do GitHub Actions mostrou que faltava `scripts/generate.mjs`. Este pacote inclui esse gerador e todos os módulos que a versão atual do editor chama.

Extraia o ZIP e envie o conteúdo extraído para a raiz do repositório, preservando as pastas. No GitHub: **Add file → Upload files** → arraste os arquivos extraídos → commit na branch `main`. Não envie o ZIP sem extraí-lo.

Depois abra **Actions → Atualizar site Peregrini**. Se necessário, use **Run workflow** em `main`. Espere `build` e `deploy` ficarem verdes.

O pacote não inclui `content/obras.json`; seu catálogo atualizado permanece intacto.
