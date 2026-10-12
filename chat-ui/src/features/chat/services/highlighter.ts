import type { Token } from 'prismjs';

export interface HighlightPart {
  text: string;
  className: string;
}

function flatten(tokens: (string | Token)[], className = ''): HighlightPart[] {
  return tokens.flatMap((token): HighlightPart[] => {
    if (typeof token === 'string') return [{ text: token, className }];
    const content = Array.isArray(token.content)
      ? token.content
      : [token.content];
    return flatten(content, `${className} token ${token.type}`.trim());
  });
}

export async function highlight(
  code: string,
  language: string,
): Promise<HighlightPart[]> {
  const { default: prism } = await import('prismjs');
  if (language === 'json') await import('prismjs/components/prism-json.js');
  if (language === 'typescript' || language === 'ts')
    await import('prismjs/components/prism-typescript.js');
  const aliases: Record<string, string> = {
    js: 'javascript',
    ts: 'typescript',
    html: 'markup',
  };
  const grammar = prism.languages[aliases[language] ?? language];
  return grammar
    ? flatten(prism.tokenize(code, grammar))
    : [{ text: code, className: '' }];
}
