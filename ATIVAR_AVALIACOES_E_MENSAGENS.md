# Ativar avaliações e mensagens privadas

O botão **Gostei** depende do Worker da Cloudflare. No repositório havia apenas o código antigo de contagem, por isso a página podia mostrar o botão, mas o envio retornava erro. O Worker atualizado também recebe a opção **Mensagem para o autor**.

## 1. Atualizar o Worker

No Cloudflare:

1. Abra **Workers & Pages → peregrini-reacoes → Edit code**.
2. Substitua o código pelo conteúdo de `reactions-service/worker.mjs` deste repositório.
3. Clique em **Deploy**.
4. Em **Settings → Bindings**, adicione o banco D1 `peregrini-reacoes` com o nome da variável exatamente `DB`.

## 2. Preparar o banco D1

Abra o console SQL do banco e cole **o conteúdo** de `reactions-service/schema.sql`. Execute os comandos SQL.

Não escreva `reactions-service/schema.sql` no console: esse é o caminho de um arquivo, não um comando SQL. O erro `near "reactions": syntax error` normalmente aparece quando o caminho, um título ou um trecho incompleto foi colado como se fosse SQL. O arquivo completo começa com `CREATE TABLE IF NOT EXISTS reactions`.

O script pode ser executado novamente; ele usa `IF NOT EXISTS` para conservar as avaliações existentes.

## 3. Criar os segredos do Worker

Em **Settings → Variables and Secrets → Add secret**, crie estes dois segredos:

- `REACTION_SALT`: no mínimo **32 caracteres**. Ele é um segredo usado para gerar identificadores protegidos; não é um arquivo, caminho ou número.
- `MESSAGES_ADMIN_KEY`: no mínimo **32 caracteres**. É a chave que abre a caixa de mensagens da área do autor.

Exemplos ilustrativos (não reutilize estes valores em produção):

```text
REACTION_SALT=vPL_7fK2!mQ9#R4xT8@N1zC6pL3wY5sD0
MESSAGES_ADMIN_KEY=MENSAGENS-CHAVE-2026!rQ7#vL2@xN9pK4sD8
```

Use valores próprios, aleatórios e diferentes entre si. Depois de salvar os segredos, faça **Deploy** novamente. Nunca coloque esses valores no GitHub, no `reactions-config.js` ou em mensagens públicas.

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

Na área `dist/admin`, a seção **Mensagens para o autor** usa `MESSAGES_ADMIN_KEY` (não a chave do GitHub). A resposta abre o aplicativo de e-mail do autor com o título, a obra e a pergunta já preenchidos. O leitor recebe a resposta no e-mail informado.

Depois de enviar os arquivos ao GitHub, aguarde a ação **Atualizar site Peregrini** terminar. Para testar uma versão nova, faça uma recarga forçada no navegador (`Ctrl+F5`).

## Se o botão continuar desativado

1. Confira `/health`.
2. Confirme que o Worker publicado é o arquivo novo, não o código antigo.
3. Confirme o vínculo D1 chamado `DB` e as três tabelas do `schema.sql`.
4. Confirme se `dist/reactions-config.js` contém apenas a URL pública do Worker.
5. Recarregue a página depois que o GitHub Pages concluir a publicação.
