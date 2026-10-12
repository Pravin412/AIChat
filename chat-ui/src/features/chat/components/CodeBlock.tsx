import { Check, Copy } from 'lucide-react';
import { useEffect, useState } from 'react';

import { IconButton } from '../../../shared/components/IconButton';
import { useCopyText } from '../../../shared/hooks/useCopyText';

import type { HighlightPart } from '../services/highlighter';

interface CodeBlockProps {
  code: string;
  language: string;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  const [parts, setParts] = useState<HighlightPart[] | null>(null);
  const { status, copy } = useCopyText();
  useEffect(() => {
    let cancelled = false;
    void import('../services/highlighter')
      .then(({ highlight }) => highlight(code, language))
      .then((result) => {
        if (!cancelled) setParts(result);
      })
      .catch(() => {
        /* Unsupported grammars keep the readable plain-text fallback. */
      });
    return () => {
      cancelled = true;
    };
  }, [code, language]);
  return (
    <div className="code-block">
      <div className="code-header">
        <span>{language || 'text'}</span>
        <IconButton
          label={status === 'copied' ? 'Code copied' : 'Copy code'}
          onClick={() => {
            void copy(code);
          }}
        >
          {status === 'copied' ? <Check size={16} /> : <Copy size={16} />}
        </IconButton>
      </div>
      <pre>
        <code>
          {parts
            ? parts.map((part, index) => (
                <span key={index} className={part.className}>
                  {part.text}
                </span>
              ))
            : code}
        </code>
      </pre>
      {status === 'error' && (
        <span role="status" className="copy-error">
          Unable to copy code.
        </span>
      )}
    </div>
  );
}
