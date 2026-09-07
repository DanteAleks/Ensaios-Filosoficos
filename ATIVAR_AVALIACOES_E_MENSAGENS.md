# Ativar avaliações e mensagens privadas

O botão **Gostei** depende do Worker da Cloudflare. No repositório havia apenas o código antigo de contagem, por isso a página podia mostrar o botão, mas o envio retornava erro. O Worker atualizado também recebe a opção **Mensagem para o autor**.

## 1. Preparar o banco D1

Se o banco `peregrini-reacoes` já existe, use-o. Caso ainda não exista:

1. No painel Cloudflare, abra **Workers & Pages → D1 SQL Database**.
2. Clique em **Create database** e use o nome `peregrini-reacoes`.
3. Abra o banco criado e selecione **Console**.
4. Cole **o conteúdo inteiro** de `reactions-service/schema.sql` e clique em **Execute**.

Não escreva `reactions-service/schema.sql` no console: esse é o caminho de um arquivo, não um comando SQL. O erro `near "reactions": syntax error` aparece quando o caminho, um título ou um trecho incompleto é colado como se fosse SQL. O arquivo completo começa com `CREATE TABLE IF NOT EXISTS reactions`.

O script pode ser executado novamente; ele usa `IF NOT EXISTS` e não apaga as avaliações existentes. Ao terminar, em **Tables**, devem aparecer `reactions`, `rate_limits` e `private_messages`.

## 2. Atualizar o Worker e vincular o D1

1. Abra **Workers & Pages → peregrini-reacoes**.
2. Selecione **Edit code**.
3. Apague o código antigo e cole o conteúdo de `reactions-service/worker.mjs`.
4. Abra a aba **Settings → Bindings**.
5. Clique em **Add binding → D1 database → Add binding**.
6. Em **Variable name**, escreva exatamente `DB`.
7. Selecione o banco `peregrini-reacoes` e confirme com **Add binding**.

O nome `DB` é obrigatório porque o código acessa o banco como `env.DB`. Consulte também a [documentação oficial de vínculo do D1](https://developers.cloudflare.com/d1/best-practices/remote-development/).

## 3. Criar os segredos do Worker

Ainda nas configurações do Worker, abra **Settings → Variables and Secrets → Add**. Selecione o tipo **Secret**, não **Text**, e crie estes dois segredos:

- `REACTION_SALT`: no mínimo **32 caracteres**. Ele é um segredo usado para gerar identificadores protegidos; não é um arquivo, caminho ou número.
- `MESSAGES_ADMIN_KEY`: no mínimo **32 caracteres**. É a chave que abre a caixa de mensagens da área do autor.

Exemplos ilustrativos (não reutilize estes valores em produção):

```text
REACTION_SALT=vPL_7fK2!mQ9#R4xT8@N1zC6pL3wY5sD0
MESSAGES_ADMIN_KEY=MENSAGENS-CHAVE-2026!rQ7#vL2@xN9pK4sD8
```

Use valores próprios, aleatórios e diferentes entre si. Depois de adicionar cada segredo, clique em **Deploy**. O valor de um Secret fica oculto no painel e continua disponível ao código como `env.REACTION_SALT` ou `env.MESSAGES_ADMIN_KEY`; não o coloque no GitHub, no `reactions-config.js` ou em mensagens públicas. Veja a [documentação oficial sobre Secrets](https://developers.cloudflare.com/workers/configuration/secrets/).

Se o painel pedir uma nova versão, confirme o **Deploy** depois de salvar o código, o vínculo D1 e os segredos. Uma alteração só fica disponível no Worker publicado depois dessa implantação.

## 4. Verificar a configuração

Abra no navegador:

```text
https://peregrini-reacoes.viaperegriniluminus.workers.dev/health
```

Quando estiver pronto, a resposta será semelhante a:

```json
{"ready":true,"missing":[]}
```

Se aparecer `ready: false`, o campo `missing` informa o que falta, por exemplo `DB`, `REACTION_SALT`, `MESSAGES_ADMIN_KEY` ou uma das tabelas.

## 5. Publicar a parte do site

O GitHub Pages executa `node scripts/generate.mjs` a cada alteração na branch `main`. A versão atual do gerador inclui, em cada leitura:

- **Gostei** e **Não gostei**; somente a contagem de corações é pública;
- **Mensagem para o autor**, com nome opcional, e-mail obrigatório e pergunta privada;
- o e-mail e a pergunta armazenados somente no D1;
- o registro anônimo de que alguém clicou em enviar e-mail.

Na área `dist/admin`, o primeiro formulário reúne o acesso ao editor e, opcionalmente, a chave `MESSAGES_ADMIN_KEY`. Assim, você informa as duas chaves uma única vez na entrada da área do autor; a chave de mensagens não é enviada ao GitHub. Depois do login, “Escreva. Revise. Publique.”, **Mensagens para o autor** e **Feedback dos textos** ficam na mesma área. O feedback mostra, de forma privada, os corações e os “não gostei” de cada obra. Se deixar a chave de mensagens em branco, ela poderá ser informada uma vez dentro do painel de mensagens; essa mesma autorização libera o feedback, sem pedir uma segunda senha.

A resposta abre o aplicativo de e-mail do autor com o título, a obra e a pergunta já preenchidos. O leitor recebe a resposta no e-mail informado.

Depois de enviar os arquivos ao GitHub, aguarde a ação **Atualizar site Peregrini** terminar. Para testar uma versão nova, faça uma recarga forçada no navegador (`Ctrl+F5`).

## Se o botão continuar desativado

1. Confira `/health`.
2. Confirme que o Worker publicado é o arquivo novo, não o código antigo.
3. Confirme o vínculo D1 chamado `DB` e as três tabelas do `schema.sql`.
4. Confirme se `dist/reactions-config.js` contém apenas a URL pública do Worker.
5. Recarregue a página depois que o GitHub Pages concluir a publicação.
