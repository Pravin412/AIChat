import { ExternalLink } from 'lucide-react';

interface SourcesListProps {
  sources: string[];
}

export function SourcesList({ sources }: SourcesListProps) {
  if (!sources.length) return null;
  return (
    <section className="sources" aria-label="Reply sources">
      <h3>Sources</h3>
      <ul>
        {sources.map((source, index) => {
          let url: URL | null = null;
          try {
            const parsed = new URL(source);
            if (['https:', 'http:'].includes(parsed.protocol)) url = parsed;
          } catch {
            /* Plain-text source names remain readable. */
          }
          return (
            <li key={`${index}-${source}`}>
              {url ? (
                <a href={url.href} target="_blank" rel="noopener noreferrer">
                  {url.hostname.replace(/^www\./, '')}
                  <ExternalLink size={13} aria-hidden="true" />
                </a>
              ) : (
                <span>{source}</span>
              )}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
