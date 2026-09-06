# Editor do autor — Arquivo Peregrini

## Instalação desta atualização

O pacote foi preparado sobre o repositório `DanteAleks/Ensaios-Filosoficos`, revisão `bf68b83a87faf013a68cb1c5e1171299d960f721`.

1. Extraia o ZIP e envie as pastas `dist/admin` e `templates` aos caminhos correspondentes no repositório. O modelo da página inicial acrescenta o acesso ao editor após a geração automática. Os arquivos devem ficar na raiz do projeto, sem uma pasta extra envolvendo tudo.
2. Faça o commit na branch padrão. O workflow `Atualizar site Peregrini`, que já está no repositório, publica automaticamente o conteúdo de `dist`.
3. Depois da publicação, clique em **Área do autor** no rodapé. Também é possível abrir `/admin/index.html` a partir da raiz publicada do site.

Este pacote não contém `content/obras.json` e não substitui seus textos. Se você mudou a apresentação da página inicial desde a revisão acima, preserve as mudanças em `templates/home.html` ao adicionar o link da Área do autor.

## Acesso inicial

O GitHub Pages hospeda arquivos estáticos. A autorização para gravar os textos é feita pela API do próprio GitHub. Esta versão usa uma chave pessoal restrita ao repositório; não cria um cadastro separado nem guarda uma senha no código.

Na primeira utilização:

1. Entre no GitHub como **DanteAleks**.
2. Abra https://github.com/settings/personal-access-tokens/new.
3. Escolha um nome, como **Editor Peregrini**, uma validade e o proprietário DanteAleks.
4. Em Repository access, escolha **Only select repositories → Ensaios-Filosoficos**.
5. Em Repository permissions, marque **Contents → Read and write**. A permissão Metadata é incluída pelo GitHub. O editor não precisa de permissão de administração nem de edição de workflows.
6. Gere a chave e guarde-a em seu gerenciador de senhas. Cole-a apenas no campo de entrada do editor, não no ChatGPT, nos arquivos ou em commits.

A chave fica em memória somente enquanto a aba está aberta. Sair ou recarregar exige uma nova entrada. Se a chave expirar, crie outra. O editor não armazena a chave em cookies, localStorage ou sessionStorage.

A página do editor é pública, como os demais arquivos hospedados; conhecer seu endereço não permite alterar o site. O editor verifica a identidade DanteAleks e o GitHub exige autorização de escrita em cada gravação. Quem tiver a sua chave poderá agir com suas permissões. Para manter edição exclusiva, não compartilhe a chave e mantenha o acesso de escrita ao repositório restrito à sua conta. O editor não altera colaboradores, regras de branch ou permissões existentes.

## Rotina de escrita

1. Abra **Área do autor** e conecte sua conta.
2. Escolha uma obra ou clique em **Nova obra**.
3. Preencha o título, tipo e resumo. Escolha a apresentação Didática ou Sintética. Cada apresentação tem conteúdo e estado próprios.
4. Escreva ou cole os parágrafos no campo Texto. Uma linha em branco separa os parágrafos. Não use JSON ou aspas especiais.
5. Use **Adicionar capítulo** e **Adicionar subcapítulo**. Os botões Subir e Descer reorganizam os textos sem mudar seus endereços.
6. Confira em **Prévia** e clique em **Salvar no GitHub**.
7. Aguarde o workflow publicar. **Acompanhar publicação** abre a execução no GitHub. “Salvo no GitHub” significa que o commit foi confirmado, não que a publicação terminou.

Alterar o título de uma obra ou capítulo preserva o endereço existente. A data das apresentações modificadas é preenchida automaticamente ao salvar. O editor reúne todos os parágrafos de um capítulo em uma única lista válida e bloqueia capítulos sem título ou obras sem capítulos.

O botão Salvar envia todas as alterações pendentes do acervo, inclusive as realizadas em outras obras durante a sessão. Remoções pedem confirmação e também só são enviadas quando você salva.

## Proteção do trabalho

O editor carrega sempre o catálogo atual do GitHub. Se outra sessão tiver alterado o catálogo, a gravação é interrompida para evitar sobrescrever esse trabalho. Baixe uma cópia do que escreveu antes de recarregar e incorpore suas mudanças na versão atual.

**Baixar cópia** salva os textos em um arquivo JSON de backup sem nenhuma credencial. Os textos não são salvos automaticamente no dispositivo. O navegador recebe um aviso de alterações pendentes ao tentar sair, mas pode não mostrar esse aviso em todas as situações; salve periodicamente.

Se a conexão cair durante a gravação, o editor tenta confirmar o resultado lendo o catálogo. Se não conseguir, ele não repete a gravação automaticamente e informa que o resultado precisa ser conferido no GitHub.

## O que era “node generate”?

`node scripts/generate.mjs` transforma o catálogo de textos em páginas HTML. O GitHub Actions já executa essa etapa após cada atualização na branch padrão. Ao usar o editor online, você não precisa executar esse comando no computador.

Para trabalhar em uma cópia offline, o processo antigo continua disponível, mas o botão Salvar no GitHub requer internet. O editor deve ser usado pela página publicada em HTTPS.

## Arquivos e verificação

- `dist/admin/index.html`: formulário e entrada do autor.
- `dist/admin/editor.css`: apresentação do editor.
- `dist/admin/editor.js`: interação, edição e prévia.
- `dist/admin/model.js`: estrutura e validação dos textos.
- `dist/admin/github.js`: autorização e gravação no arquivo fixo `content/obras.json`.
- `tests/editor.test.cjs`: verificações com respostas simuladas do GitHub.

Os testes verificam preservação do conteúdo, Unicode, bloqueio de outras contas, conflitos de edição, erros de permissão e reconciliação de falha de rede. Não foi realizado login real nem gravação com uma chave do autor, e não houve teste visual em navegador neste ambiente. Não foram modificadas as permissões do repositório.

Documentação oficial do GitHub:
- https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/managing-your-personal-access-tokens
- https://docs.github.com/en/rest/repos/contents
