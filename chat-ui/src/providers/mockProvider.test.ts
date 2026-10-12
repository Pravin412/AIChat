import { describe, expect, it } from 'vitest';

import { mockProvider } from './mockProvider';

import type { ChatRequest } from './types';

const request: ChatRequest = {
  conversationId: 'test',
  message: 'Hello',
  history: [],
  channel: 'webchat',
};

describe('mockProvider', () => {
  it('streams the full reply and metadata', async () => {
    const stream = mockProvider.stream(request);
    let reply = '';
    let next = await stream.next();
    while (!next.done) {
      reply += next.value.delta;
      next = await stream.next();
    }
    expect(reply).toBe(next.value.reply);
    expect(reply).toContain('```json');
    expect(reply).toContain('| Topic |');
  }, 15_000);
  it('returns emergency information for chest pain', async () => {
    const result = await mockProvider.send({
      ...request,
      message: 'chest pain',
    });
    expect(result.emergency).toBe(true);
    expect(result.sources).not.toHaveLength(0);
  });
  it('aborts a pending stream delay', async () => {
    const controller = new AbortController();
    const stream = mockProvider.stream({
      ...request,
      signal: controller.signal,
    });
    const pending = stream.next();
    controller.abort();
    await expect(pending).rejects.toMatchObject({ name: 'AbortError' });
  });
});
