# Atualização v12 — Área Peregrini

Esta versão mantém a edição exclusiva do autor pelo editor do GitHub e acrescenta uma área própria para escritos originais em Peregrini.

## O que foi integrado

- entrada **Peregrini** no cabeçalho da página inicial;
- portal com aviso introdutório, arquivo exclusivo, alfabeto, maiúsculas, minúsculas, pronúncia, nasalização e vocabulário ratificado;
- fontes `PalavraPeregriniTexto`, `PalavraPeregriniDisplay` e `PalavraPeregriniIluminada`, copiadas automaticamente para `dist/fonts` durante o build;
- botão **Novo texto Peregrini** na área do autor, com paleta das 28 letras, direção visual RTL/LTR, estilos de título/subtítulo, formatação e capitular iluminada;
- coleções recolhidas em pequenos portais, ordenação por leitura do autor ou data e indicação do texto mais novo;
- seção de atualizações na página inicial;
- restauração de posição de leitura também para títulos criados pelo editor contínuo;
- validação do build para impedir a publicação sem o portal ou sem as três fontes web.

## Publicação local

```bash
node scripts/generate.mjs
node scripts/verify-site.mjs
```

O workflow `.github/workflows/peregrini-pages.yml` executa os mesmos passos antes de publicar o artefato do GitHub Pages. Os arquivos em `Fonts/Palavra-Peregrini-Colecao-v1.0/` são a fonte das famílias web; não é necessário copiar manualmente os WOFF2 para `dist`.

## Escritos em Peregrini

O editor grava o texto no mesmo `content/obras.json`, marcado com `"language": "peregrini"`. A direção e os estilos são dados pelos blocos do documento. O portal informa quando uma entrada ainda é apenas proposta; não são criadas traduções ou palavras novas automaticamente.
