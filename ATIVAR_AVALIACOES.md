# Ativar corações e avaliações privadas

Este pacote foi preparado sobre a versão cf3b3f0c93dae15a870035c7edfbbb899310a75c
do repositório DanteAleks/Ensaios-Filosoficos.

O código está pronto, mas o registro de avaliações só funciona depois de
conectar um serviço na sua conta Cloudflare. Os botões ficam desativados até
essa configuração; não existem votos simulados. O site continua no GitHub Pages.
Não há necessidade de executar comandos para a instalação descrita abaixo.

## 1. Criar o banco privado

Entre em https://dash.cloudflare.com/ ou crie sua conta. Confira os limites e
condições do plano escolhido no painel; este pacote não contrata um serviço.
Procure D1 SQL Database e crie um banco chamado `peregrini-reacoes`.
Abra o banco e, na aba Console, execute o conteúdo de
`reactions-service/schema.sql`. Se o console pedir uma instrução de cada vez,
execute cada bloco terminado em ponto e vírgula separadamente.

## 2. Criar o serviço

Em Workers & Pages, crie um Worker chamado `peregrini-reacoes`, usando o exemplo
Hello World. No editor de código, substitua o exemplo inteiro pelo conteúdo de
`reactions-service/worker.mjs`. Salve/publice o Worker.

Em Bindings, adicione um vínculo do tipo D1 database. O nome da variável deve
ser exatamente `DB`. Selecione o banco `peregrini-reacoes` criado acima.

Em Settings > Variables and Secrets, adicione um Secret chamado
`REACTION_SALT`. Use um valor aleatório de pelo menos 32 caracteres, gerado
pelo seu gerenciador de senhas. Guarde-o; não envie aqui, não publique no GitHub
e não troque depois sem planejar a migração, pois ele identifica os votos.

Publique as alterações e copie a URL HTTPS do Worker, terminada em workers.dev.
O endereço público do Worker pode ser compartilhado; ele não é uma senha.

## 3. Ligar o site ao serviço

Abra `dist/reactions-config.js` deste pacote e preencha apiUrl entre aspas:

window.PeregriniReactionsConfig = {
  apiUrl: 'https://SEU-WORKER.SEU-SUBDOMINIO.workers.dev'
};

Use o endereço real do seu Worker, sem caminhos ou parâmetros adicionais.
Não coloque tokens do GitHub, senhas ou a REACTION_SALT nesse arquivo.

## 4. Enviar o pacote ao GitHub

Extraia o ZIP e copie as pastas para a raiz do seu repositório, mesclando-as e
substituindo os arquivos de mesmo nome, sem apagar pastas existentes.
Os arquivos em dist e scripts são os que atualizam o site. A pasta
reactions-service contém o serviço separado para a Cloudflare; colocá-la no
GitHub, sozinho, não publica esse serviço.

Confirme as alterações na branch principal e aguarde Actions > Atualizar site
Peregrini concluir. Esse processo gera também reactions-manifest.json, que
informa ao serviço quais textos publicados podem receber avaliações.
O pacote não inclui content/obras.json nem páginas geradas antigas.
Seu contato por e-mail, a nota sobre IA e os textos atuais são preservados.

## 5. Consultar os resultados privados

Na SUA conta Cloudflare, abra D1 > peregrini-reacoes > Console e execute:

SELECT * FROM resumo_avaliacoes ORDER BY texto;

As colunas são `texto` (obra/apresentação), `coracoes` e `nao_gostei`.
Somente quem tem acesso à sua conta/banco pode consultar esse resumo.
Não conceda esse acesso a terceiros. A API pública não oferece consulta de
avaliações negativas, totais de votos ou lista de votantes.

## 6. Conferir depois da ativação

Abra um ensaio. Os botões devem ficar habilitados e mostrar o número de
corações. Clique em Gostei, troque para Não gostei e clique novamente para
retirar. Confira no console privado se a contagem mudou corretamente.
Apenas a sua escolha aparece marcada no seu navegador; não existe contador
público de avaliações negativas. Uma obra nova pode levar cerca de um minuto,
após publicada, para ser reconhecida pelo serviço.

## Como os votos funcionam

Uma escolha por texto/apresentação e identificador de navegador, com troca e
retirada. Sem login de leitores, não há garantia de um voto por pessoa:
outro navegador ou limpeza de dados permite criar outro identificador.
Há um limite básico de 60 tentativas de gravação por endereço de rede por dia;
redes compartilhadas também compartilham esse limite. Isso reduz abuso básico,
mas não substitui proteção especializada contra ataques ou bots.

O navegador guarda um identificador aleatório e a sua seleção. O banco guarda
um hash desse identificador, o texto e a escolha. Não recebe nome nem e-mail.
O limite de uso emprega um hash diário do endereço de rede, sem salvar o IP
literal no banco. O provedor ainda processa as requisições segundo suas próprias
políticas. Mensagens continuam no aplicativo de e-mail do leitor.

## Verificação realizada

O serviço foi testado com SQLite local: votos persistem, repetição não duplica,
troca e retirada funcionam, consultas públicas não revelam negativos, entradas
inválidas são rejeitadas e o limite de uso é aplicado. Dois testes de interface
em DOM simulado verificaram botões desativados antes da configuração, alterações
de voto e falha de rede sem confirmação falsa. Oito testes passaram.
Ainda não houve implantação nem teste contra sua conta Cloudflare real.

Testes para desenvolvimento: Node 24, `node --test tests/reactions.test.mjs`.
O teste reactions-ui.test.cjs requer jsdom no ambiente do desenvolvedor.

Documentação oficial consultada:
https://developers.cloudflare.com/d1/get-started/
https://developers.cloudflare.com/workers/configuration/secrets/
