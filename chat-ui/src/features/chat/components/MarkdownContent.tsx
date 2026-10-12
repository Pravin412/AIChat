import { memo } from 'react';
import Markdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

import { CodeBlock } from './CodeBlock';

import type { Components } from 'react-markdown';

const components: Components = {
  pre({ children }) {
    return <>{children}</>;
  },
  code({ className, children, node }) {
    const language = /language-([\w-]+)/.exec(className ?? '')?.[1] ?? '';
    const code = String(children).replace(/\n$/, '');
    const block =
      Boolean(language) ||
      (node?.position
        ? node.position.end.line > node.position.start.line
        : code.includes('\n'));
    return block ? (
      <CodeBlock code={code} language={language} />
    ) : (
      <code className="inline-code">{children}</code>
    );
  },
  table({ children }) {
    return (
      <div className="table-scroll">
        <table>{children}</table>
      </div>
    );
  },
  a({ href, children }) {
    return (
      <a href={href} target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    );
  },
  img({ alt }) {
    return <span>{alt ? `[Image: ${alt}]` : '[Image]'}</span>;
  },
};

interface MarkdownContentProps {
  content: string;
}

export const MarkdownContent = memo(function MarkdownContent({
  content,
}: MarkdownContentProps) {
  return (
    <div className="markdown">
      <Markdown remarkPlugins={[remarkGfm]} components={components} skipHtml>
        {content}
      </Markdown>
    </div>
  );
});
