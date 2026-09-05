# Arquivo Peregrini — manutenção

O site é estático. As páginas individuais e o acervo são gerados a partir de `content/obras.json`. Não é necessário instalar dependências. O conteúdo pode ser lido sem JavaScript; JavaScript acrescenta filtros e preferências de leitura.

## Atualizar ou adicionar textos

1. Edite `content/obras.json`. Para adicionar uma obra, copie um objeto completo da lista `works` e escolha um `id` exclusivo, sem acentos ou espaços. Mantenha os IDs de obras e versões já compartilhadas para preservar os endereços.
2. Preencha `title`, `kind` (por exemplo, `Ensaio`, `Teoria social` ou `Suma`) e `summary`. O autor comum fica em `author`.
3. Em `variants`, inclua uma ou ambas as apresentações: `sintetico` e `didatico`. Cada apresentação possui seus próprios capítulos e metadados.
4. Em cada versão, defina `status` como `andamento` ou `finalizado`; `availability` como `integral`, `trecho` ou `demonstracao`; e `updated` como a data real da atualização, no formato `2026-09-05`. Use `null` quando não souber a data. A data não é inventada automaticamente.
5. Para versões em andamento, preencha `last` (última parte escrita) e `next` (parte futura). Esses campos informam o progresso editorial, sem inventar um percentual de conclusão.
6. Escreva os capítulos em `chapters`. Cada capítulo tem `id`, `title`, `paragraphs` (uma lista de parágrafos) e `subchapters` (uma lista opcional, ou vazia). Subcapítulos também têm `id`, `title` e `paragraphs`. Os IDs de capítulos e subcapítulos devem ser únicos dentro da versão. Use texto simples; caracteres especiais são protegidos ao gerar o HTML.
7. Execute `node scripts/generate.mjs` na pasta do projeto. O comando valida o catálogo antes de atualizar o acervo e as páginas em `dist/obras/`.
8. Abra `dist/index.html` para revisão local. Envie as alterações pelo fluxo de publicação do site quando quiser colocá-las online. Gerar ou salvar o código não publica automaticamente.

Exemplo de capítulo com subcapítulo:

```json
{
  "id": "questao-inicial",
  "title": "A questão inicial",
  "paragraphs": ["Primeiro parágrafo.", "Segundo parágrafo."],
  "subchapters": [
    {
      "id": "primeira-distincao",
      "title": "Uma primeira distinção",
      "paragraphs": ["Texto do subcapítulo."]
    }
  ]
}
```

## Arquivos de apresentação

- `templates/home.html`: apresentação da página inicial. Preserve `{{WORKS}}` e `{{SUMAS}}`.
- `scripts/generate.mjs`: validação e geração das páginas de leitura.
- `dist/styles.css`: estilos da página inicial, leitura e impressão.
- `dist/preferences.js`: guarda tema, fonte e tamanho da letra neste navegador. Continua funcionando quando o armazenamento está bloqueado.
- `dist/reader.js`: controles de leitura, navegação e impressão.
- `dist/app.js`: filtros e menu do acervo.

Os arquivos `dist/index.html` e `dist/obras/**/*.html` são gerados; faça as alterações de conteúdo no catálogo, para não perdê-las na próxima geração. As páginas de apresentações diferentes da mesma obra são vinculadas automaticamente. O endereço inclui o ID da obra e da apresentação, por exemplo `obras/brevis/sintetico.html`.

## Leitura e PDF

O leitor escolhe fonte clássica (Georgia), de livro (Palatino, quando instalada) ou simples (Arial), tamanho entre 80% e 160% e tema claro ou escuro. As fontes têm alternativas locais. O tamanho acompanha também a preferência de fonte padrão do navegador. O botão Restaurar aparência retorna aos valores iniciais.

“Imprimir / salvar como PDF” abre a impressão do navegador. É possível selecionar Salvar como PDF nessa janela; não se trata de um download automático. Toda a apresentação disponível, inclusive seus subcapítulos, entra na impressão; controles e navegação são ocultados. O tema de impressão é sempre claro.

## Estado do acervo

Os textos em latim são demonstrações. Os textos existentes em português permanecem identificados como trechos. Os documentos Word não foram importados nem substituídos neste trabalho. Altere a disponibilidade para `integral` apenas depois de inserir o conteúdo completo correspondente.
