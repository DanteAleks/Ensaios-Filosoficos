# Área Peregrini · versão 14

Esta atualização usa as fontes da coleção 1.2 que estão em `fontes/woff2` na raiz do repositório.

## Percurso das páginas

| Referência | Arquivo publicado | Conteúdo |
| --- | --- | --- |
| Página 1 | `index.html` | Inicial; a inscrição Peregrini abre a apresentação da Via. |
| Página 3 | `peregrini/via.html` | Informação breve; “Prosseguir Área Peregrini” abre os escritos. |
| Página 2 | `peregrini/index.html` | Escritos em Peregrini e uma caixa para abrir o guia do idioma. |
| Página 4 | `peregrini/idioma.html` | Letras, referências de pronúncia e vocabulário pesquisável. |

## Editar o vocabulário

1. Entre na área do autor com a mesma autorização do GitHub usada para os textos.
2. Abra **Vocabulário Peregrini** na navegação da área do autor.
3. Digite a palavra, escolha a classe gramatical e informe seu significado. Pronúncia e exemplo de uso são opcionais. A paleta oferece maiúsculas e minúsculas, e a prévia mostra a palavra em RTL.
4. Clique em **Adicionar ao vocabulário** ou **Guardar edição**.
5. Clique em **Publicar alterações** no alto da página. O indicador de publicação confirma quando o GitHub Pages disponibiliza a versão.

As palavras ficam no campo `peregrini.lexicon` de `content/obras.json`. Cada entrada pode conter palavra, significado, classe gramatical (`substantivo`, `verbo`, `adjetivo`, `adverbio` ou `expressao`), pronúncia e exemplo. Entram na mesma cópia de segurança e no mesmo rascunho dos escritos. Enquanto esse campo não existir, o site mostra as palavras já conhecidas do vocabulário original. Nenhuma outra chave é necessária.

O site conserva as letras na ordem lógica de leitura e usa composição visual da direita para a esquerda. Por exemplo, o valor armazenado `ДA` aparece visualmente `AД`. Não inverta as strings manualmente: isso produziria uma segunda inversão.

A ordem alfabética acompanha o alfabeto Peregrini e distingue caracteres como `P`, `П` e `R`. A busca também encontra significados e pronúncias. Os exemplos do alfabeto são palavras de apoio sonoro em português; não são novas entradas do vocabulário Peregrini.

## Publicar e executar

O workflow `peregrini-pages.yml` gera o site automaticamente a cada atualização da branch principal. No GitHub Pages, a origem da publicação deve ser **GitHub Actions**.

Para gerar localmente, usando Node.js:

```sh
node scripts/generate.mjs
node scripts/verify-site.mjs
```

Os arquivos prontos ficam em `dist`. Preserve a pasta `fontes` completa e suas licenças. Os textos e rascunhos existentes não precisam ser refeitos.
