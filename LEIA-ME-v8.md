# Editor Peregrini — versão 8

Atualização preparada sobre os arquivos consultados no repositório DanteAleks/Ensaios-Filosoficos em 08/09/2026. Este pacote atualiza o código. Seu catálogo content/obras.json e suas imagens continuam no repositório existente.

## Instalar

1. Extraia o ZIP. Dentro dele estão dist, scripts, templates e tests.
2. Coloque essas pastas na raiz do repositório Ensaios-Filosoficos, mesclando-as com as existentes e substituindo os arquivos correspondentes. Não apague a pasta dist inteira: ela contém outros arquivos e imagens do seu site.
3. Envie as alterações à branch principal. Pela interface web do GitHub, use Add file → Upload files e arraste o conteúdo extraído, mantendo as pastas. Confirme o commit.
4. Aguarde a ação “Atualizar site Peregrini” concluir. Ela executa o gerador automaticamente: você não precisa executar Node no computador para publicar pelo editor.
5. Abra https://dantealeks.github.io/Ensaios-Filosoficos/admin/ e recarregue a página. Os arquivos do editor têm um identificador de versão para solicitar o código atualizado.

Para esta atualização não é necessário alterar o Cloudflare, o banco ou os segredos. Mensagens e feedback continuam com a configuração anterior.

## Recuperar sua suma

Um rascunho local fica somente no navegador em que foi salvo. Abra o editor nesse mesmo navegador e perfil, faça login e use “Recuperar rascunho para publicar”. Não limpe os dados do navegador antes de recuperar o texto.

Se você baixou uma cópia JSON, clique em “Importar rascunho”, escolha o arquivo e marque a suma que deseja recuperar. Essa função aceita as cópias de catálogo e os rascunhos JSON exportados pelo editor. Ela não importa arquivos Word: para o Word, copie e cole o texto no documento.

Se o catálogo publicado mudou desde o rascunho, alterações sem conflito são integradas. Um texto conflitante é recuperado como uma nova obra com “rascunho recuperado” no título; a obra publicada é preservada. Revise as cópias antes de publicar. Exclusões antigas não são reaplicadas automaticamente durante a integração.

Depois de recuperar, escolha a categoria Suma, revise e clique em “Publicar alterações”. “Salvar rascunho” guarda uma cópia local; “Publicar alterações” envia ao GitHub. A interface informa a gravação e verifica quando a publicação aparece no site. Se o GitHub recusar, o aviso mostra o erro; sua cópia local permanece disponível.

## Escrever com formatação

O documento é contínuo. Escreva diretamente ou cole um texto do Word. Selecione uma linha e escolha “Título de capítulo” ou “Subtítulo”; o sumário será criado automaticamente. Uma obra também pode conter apenas parágrafos.

A barra inclui negrito, itálico, sublinhado, tachado, quatro alinhamentos, listas, citação, desfazer, refazer e limpeza de formatação. Para centralizar uma palavra, coloque-a em seu próprio parágrafo e aplique “Centralizar”.

A colagem preserva a formatação textual suportada, convertendo-a para os estilos Peregrini. O layout completo do Word, imagens, tabelas e fontes externas não são reproduzidos. No navegador, use seleção do texto e os botões de formatação; as operações de edição dependem do suporte do navegador.

Textos antigos são abertos com seus capítulos e parágrafos preservados. O gerador publica HTML pronto; o leitor não precisa carregar o editor.

## Coleções e ordem de leitura

Em cada obra, preencha “Coleções”, separando nomes com ponto e vírgula: Kant; Conhecimento. A obra pode pertencer a várias coleções. Use nomes iguais para reuni-las. As coleções aparecem automaticamente no acervo; remover a última associação também remove a coleção vazia.

Use “Antes na leitura” e “Depois na leitura” para definir a ordem autoral das obras. Essa ordem é usada nos ensaios, nas sumas e dentro das coleções, respeitando os textos pertencentes a cada grupo. Clique em Publicar alterações para torná-la pública.

O leitor pode escolher ordem autoral, publicação mais recente ou mais antiga em cada grupo. Novas obras recebem a data ao publicar. Para obras anteriores sem data histórica conhecida, preencha “Data da primeira publicação” manualmente: não se presume que a data de revisão seja a data de publicação.

O selo “Mais novo” identifica a publicação de data mais recente em cada categoria e coleção. Obras publicadas no mesmo dia podem compartilhar o selo. Textos sem data ficam depois dos textos datados na ordenação cronológica.

## Verificação realizada

Testes locais de edição, integração de rascunhos, geração de HTML, coleções, ordenação e acesso ao GitHub com respostas simuladas. A validação também cobre mensagens e reações existentes. Não foram usadas suas chaves nem foi feita uma publicação autenticada em seu nome.

Foram corrigidos o tratamento de listas vazias em subcapítulos e a leitura do catálogo pelo GitHub quando o endpoint de conteúdo não retorna o arquivo completo. O acesso de publicação continua exclusivo da conta autorizada.
