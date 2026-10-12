import { checkAbort } from '../shared/utils/abort';

import { ProviderError } from './providerErrors';

export interface SseEvent {
  event: string;
  data: string;
}

export async function* parseSse(
  body: ReadableStream<Uint8Array>,
  signal?: AbortSignal,
): AsyncGenerator<SseEvent> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = '';
  let event = 'message';
  let data: string[] = [];
  const onAbort = () => {
    void reader.cancel(signal?.reason).catch(() => undefined);
  };
  signal?.addEventListener('abort', onAbort, { once: true });
  try {
    while (true) {
      checkAbort(signal);
      const { value, done } = await reader.read();
      checkAbort(signal);
      buffer += decoder.decode(value, { stream: !done });
      // Hold a trailing CR so a CRLF split across network chunks stays one newline.
      let match = /\r\n|\n|\r(?!$)/.exec(buffer);
      while (match) {
        const line = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        if (line === '') {
          if (data.length) yield { event, data: data.join('\n') };
          event = 'message';
          data = [];
        } else if (!line.startsWith(':')) {
          const colon = line.indexOf(':');
          const field = colon < 0 ? line : line.slice(0, colon);
          const raw = colon < 0 ? '' : line.slice(colon + 1);
          const content = raw.startsWith(' ') ? raw.slice(1) : raw;
          if (field === 'event') event = content;
          if (field === 'data') data.push(content);
        }
        match = /\r\n|\n|\r(?!$)/.exec(buffer);
      }
      if (
        buffer.length + data.reduce((sum, line) => sum + line.length, 0) >
        1_000_000
      ) {
        throw new ProviderError(
          'The assistant response is too large.',
          'INVALID_STREAM',
        );
      }
      if (done) break;
    }
    if (buffer.trim() || data.length) {
      throw new ProviderError(
        'The assistant stream ended unexpectedly.',
        'INVALID_STREAM',
      );
    }
  } finally {
    signal?.removeEventListener('abort', onAbort);
    await reader.cancel().catch(() => undefined);
    reader.releaseLock();
  }
}
