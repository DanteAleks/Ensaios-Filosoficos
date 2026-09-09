# Área Peregrini · versão 15

Esta versão corrige a inscrição e a navegação da área Peregrini e usa a coleção de fontes presente em `fontes/`.

## Percurso

| Página | Arquivo | Função |
| --- | --- | --- |
| 1 | `index.html` | Arquivo geral; a caixa de entrada mostra somente `Пereгrиhи` e abre a informação prévia. |
| 3 | `peregrini/via.html` | Alerta breve sobre a Via; **Prosseguir Área Peregrini** abre os escritos. |
| 2 | `peregrini/index.html` | Escritos originais em Peregrini e porta para o idioma. |
| 4 | `peregrini/idioma.html` | Alfabeto, leitura, vocabulário e pesquisa. |

Nas páginas 2 e 3, o letreiro é `Cлovo Пereгrиhи` e o navegador recebe a direção RTL por meio de `<bdo dir="rtl">`. As strings devem continuar armazenadas na ordem lógica Peregrini; não as inverta manualmente.

## Alfabeto e vocabulário

Os sete exemplos de cada letra são palavras únicas em português, uma para cada vogal Peregrini. Eles são referências sonoras e não entram automaticamente no vocabulário; `caixa` é usada como exemplo para o som de X. A barra superior da página 4 agora inclui **Vocabulário**.

O vocabulário continua sendo editável na área do autor, com palavra, significado, pronúncia, exemplo e classe gramatical. A mesma caixa de edição também permite remover uma palavra, sempre com confirmação. As alterações só aparecem no site depois de **Publicar alterações**.

## Gerar e verificar

```sh
node scripts/generate.mjs
node scripts/verify-site.mjs
```

O workflow do GitHub Pages executa esses comandos antes de publicar `dist`. Depois de editar o catálogo ou o vocabulário, faça commit na branch principal e aguarde os trabalhos `build` e `deploy`.
