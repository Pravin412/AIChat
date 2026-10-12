import { afterEach, describe, expect, it, vi } from 'vitest';

import { createHttpProvider } from './httpProvider';

import type { ChatRequest } from './types';

const request: ChatRequest = {
  conversationId: 'test',
  message: 'Hello',
  history: [],
  channel: 'webchat',
};
const result = {
  reply: 'Hello',
  emergency: false,
  needsHuman: false,
  sources: [],
};

function mockStream(parts: string[]) {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    start(controller) {
      parts.forEach((part) => controller.enqueue(encoder.encode(part)));
      controller.close();
    },
  });
  const fetchMock = vi
    .fn()
    .mockResolvedValue(
      new Response(body, { headers: { 'Content-Type': 'text/event-stream' } }),
    );
  vi.stubGlobal('fetch', fetchMock);
  return fetchMock;
}

afterEach(() => vi.unstubAllGlobals());

describe('httpProvider', () => {
  it('parses split CRLF events and sends the contract body', async () => {
    const fetchMock = mockStream([
      'event: delta\r',
      '\ndata: {"delta":"Hello"}\r\n\r',
      `\nevent: done\ndata: ${JSON.stringify(result)}\n\n`,
    ]);
    const stream = createHttpProvider('https://example.test/').stream(request);
    expect(await stream.next()).toEqual({
      done: false,
      value: { delta: 'Hello' },
    });
    expect(await stream.next()).toEqual({ done: true, value: result });
    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect(init.method).toBe('POST');
    expect(JSON.parse(init.body as string)).toEqual(request);
    expect(fetchMock.mock.calls[0][0]).toBe(
      'https://example.test/v1/chat/stream',
    );
  });
  it('reports an SSE error event', async () => {
    mockStream(['event: error\ndata: {"message":"Please retry"}\n\n']);
    await expect(
      createHttpProvider('https://example.test').stream(request).next(),
    ).rejects.toThrow('Please retry');
  });
  it.each([
    'event: delta\ndata: broken\n\n',
    'event: delta\ndata: {"delta":42}\n\n',
    'event: delta\ndata: {"delta":"Hi"}',
  ])('rejects malformed stream %s', async (body) => {
    mockStream([body]);
    await expect(
      createHttpProvider('https://example.test').stream(request).next(),
    ).rejects.toThrow();
  });
  it('requires a done event', async () => {
    mockStream(['event: delta\ndata: {"delta":"Hi"}\n\n']);
    const stream = createHttpProvider('https://example.test').stream(request);
    await stream.next();
    await expect(stream.next()).rejects.toThrow('before completion');
  });
  it.each([
    [401, 'not authorized'],
    [422, 'check your message'],
    [429, 'Too many requests, please wait'],
    [503, 'Assistant is unavailable'],
  ])('maps HTTP %s', async (status, message) => {
    vi.stubGlobal(
      'fetch',
      vi
        .fn()
        .mockResolvedValue(
          new Response(
            JSON.stringify({ error: { code: 'test', message: 'internal' } }),
            { status: Number(status) },
          ),
        ),
    );
    await expect(
      createHttpProvider('https://example.test').send(request),
    ).rejects.toThrow(String(message));
  });
});
