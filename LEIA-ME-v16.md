# Exemplos oficiais e fórmulas LaTeX

## Alfabeto Peregrini

A tabela pública usa a coluna **Combinações e exemplos vocálicos em português** do documento *Alfabeto Peregrini Oficial*, versão 5, de 24 de agosto de 2026. Os exemplos anteriores criados apenas para preencher as sete vogais foram removidos.

## Fórmulas na área do autor

Os editores comum e Peregrini possuem dois botões:

- **LaTeX em linha** para fórmulas inseridas dentro de um parágrafo;
- **LaTeX em destaque** para fórmulas centralizadas em uma linha própria.

Digite somente o conteúdo da fórmula na caixa aberta pelo botão. Por exemplo:

```tex
\forall x \in A,\; P(x) \rightarrow Q(x)
```

Também é possível digitar os delimitadores diretamente no documento:

```tex
\(x^2+y^2=z^2\)

\[
\sum_{n=1}^{\infty}\frac{1}{n^2}=\frac{\pi^2}{6}
\]
```

As fórmulas são preservadas no rascunho e no catálogo como texto LaTeX. Na prévia e nas páginas de leitura, o MathJax 3.2.2 local converte a notação para SVG. Em textos Peregrini, a fórmula permanece da esquerda para a direita dentro da página RTL.

## Publicação

O site continua sendo gerado sem instalar dependências:

```sh
node scripts/generate.mjs
node scripts/verify-site.mjs
```

O renderizador matemático está em `dist/vendor/mathjax` e deve permanecer no repositório com sua licença.
