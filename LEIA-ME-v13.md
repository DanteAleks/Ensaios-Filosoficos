# Atualização v13 — direção e tipografia Peregrini

Esta versão corrige o fluxo de escrita Peregrini no editor do autor:

- a direção visual RTL é aplicada ao editor e a todos os blocos publicados;
- a paleta oferece cada letra oficial em maiúscula e minúscula;
- a capitular iluminada permanece junto da palavra, sem separar a primeira letra;
- `Prosseguir a via` abre `peregrini/via.html`, uma página própria de informação prévia;
- a aba do idioma exibe combinações de cada letra com as sete vogais Peregrini e não exibe a coluna de estado;
- Texto, Display e Iluminada podem ser escolhidas no leitor e aplicadas a trechos de qualquer obra;
- a obra Peregrini existente no catálogo continua sendo tratada como conteúdo original, não tradução.

Para gerar e conferir localmente:

```sh
node scripts/generate.mjs
node scripts/verify-site.mjs
```

Digite as palavras na ordem lógica normal. A página faz a composição visual da direita para a esquerda; não inverta manualmente as strings.
