// JSON.parse accepts repeated keys silently. Reject them to prevent lost paragraphs.
export function parseCatalog(source) {
  let data;
  try { data = JSON.parse(source); }
  catch (error) { throw new Error(`content/obras.json inválido: ${error.message}. Use uma única lista paragraphs por capítulo, com parágrafos entre aspas separados por vírgulas; escreva quebras de linha como \\n.`); }
  const tokens = source.match(/"(?:\\.|[^"\\])*"|[{}\[\]:,]|[^\s{}\[\]:,]+/g) || [];
  const stack = [];
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i];
    if (token === '{') stack.push(new Set());
    else if (token === '[') stack.push(null);
    else if (token === '}' || token === ']') stack.pop();
    else if (token.startsWith('"') && tokens[i + 1] === ':') {
      const key = JSON.parse(token), keys = stack.at(-1);
      if (keys.has(key)) throw new Error(`Campo repetido "${key}" em content/obras.json. Cada capítulo deve ter uma única lista paragraphs, com todos os parágrafos dentro dela.`);
      keys.add(key);
    }
  }
  return data;
}
