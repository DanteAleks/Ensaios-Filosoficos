# Peregrini — correção v10

Preparado sobre o commit 8a89c5d do repositório DanteAleks/Ensaios-Filosoficos.
A execução 34183669751 já havia sido publicada com sucesso. A explicação anterior de que bastava rodar o workflow novamente não resolvia as falhas de interface.

## Aplicação

Este pacote contém as pastas completas de código do site e as imagens restauradas. Não contém o catálogo content/obras.json: mantenha essa pasta no seu repositório.

Extraia o ZIP. Copie o conteúdo para a raiz de sua cópia local do repositório, MESCLANDO as pastas (não apague a pasta do repositório nem a pasta content). No macOS, para mesclar com segurança, pode usar:

    ditto /caminho/da/pasta/extraida /caminho/do/Ensaios-Filosoficos

Revise as alterações no GitHub Desktop, faça commit e Push origin. Aguarde o novo build e deploy. A nova área do autor está em:
https://dantealeks.github.io/Ensaios-Filosoficos/admin/index.html?v=10

A barra superior indica “Editor do autor · v10”. Não limpe o armazenamento do navegador, pois ele contém os rascunhos.

## Uso

Após entrar, selecione uma obra. A seção Documento contém a barra de formatação. Para capítulos use “Título de capítulo”; para subcapítulos use “Subtítulo”. O sumário é gerado pelos títulos. Selecione o parágrafo para centralizar.

“Importar rascunho” aceita JSON exportado pelo editor, com seleção das obras. Arquivos Word não são importados como arquivos: copie o conteúdo do Word e cole no Documento. A colagem preserva a formatação textual suportada, sem imagens e tabelas.

Em “Coleções”, digite por exemplo Kant; Ética. Coleções só ganham obras depois de publicar essa associação. Use “Data da primeira publicação” e os botões de ordem de leitura para organizar o acervo. Salvar rascunho guarda localmente; Publicar alterações grava no GitHub.

## Correções verificadas

- Importação seleciona as obras existentes e avisa quando nenhuma é selecionada.
- Títulos colados com IDs inválidos ou em conflito com a introdução recebem IDs válidos.
- Sublinhado e tachado com text-decoration-line são preservados.
- Alinhamento passa a usar classes CSS permitidas pela política do editor.
- Imagem do peregrino e favicon restaurados; bordas e ornamentos refinados.
- Novo build verifica se os recursos referenciados realmente existem.
- Identificador v10 nos arquivos e link da área do autor.

27 testes locais passaram, incluindo DOM, importação, publicação simulada e geração de coleções. O gerador produziu 5 obras e 6 páginas a partir do catálogo consultado. Não foi realizado teste visual completo em navegador nem gravação autenticada pelo editor. A tentativa de gravar pelo conector GitHub recebeu 403 Resource not accessible by integration; esta correção não foi enviada ao repositório por esta sessão.
