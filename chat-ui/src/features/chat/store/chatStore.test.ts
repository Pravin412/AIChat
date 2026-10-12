import { beforeEach, describe, expect, it } from 'vitest';

import { useChatStore } from './chatStore';

beforeEach(() =>
  useChatStore.setState({ messages: [], generating: false, error: null }),
);

describe('chatStore', () => {
  it('separates the current message from bounded history', () => {
    for (let index = 0; index < 12; index++) {
      const prepared = useChatStore.getState().prepare(`Question ${index}`);
      useChatStore
        .getState()
        .finish(prepared.assistantId, { reply: `Answer ${index}` });
    }
    const { request } = useChatStore.getState().prepare('Current question');
    expect(request.history).toHaveLength(20);
    expect(request.history.at(-1)?.content).toBe('Answer 11');
    expect(request.message).toBe('Current question');
  });
  it('replaces the last user turn on edit or regeneration', () => {
    const first = useChatStore.getState().prepare('Original');
    useChatStore.getState().finish(first.assistantId, { reply: 'Answer' });
    const replacement = useChatStore.getState().prepare('Edited', true);
    expect(replacement.request.history).toEqual([]);
    expect(useChatStore.getState().messages).toHaveLength(2);
    expect(useChatStore.getState().messages[0].content).toBe('Edited');
  });
  it('preserves completed message references during streaming', () => {
    const first = useChatStore.getState().prepare('First');
    useChatStore.getState().finish(first.assistantId, { reply: 'Complete' });
    const completed = useChatStore.getState().messages[1];
    const next = useChatStore.getState().prepare('Second');
    useChatStore.getState().append(next.assistantId, 'Delta');
    expect(useChatStore.getState().messages[1]).toBe(completed);
    expect(useChatStore.getState().messages.at(-1)?.content).toBe('Delta');
  });
  it('rejects empty and oversized messages', () => {
    expect(() => useChatStore.getState().prepare(' ')).toThrow();
    expect(() => useChatStore.getState().prepare('a'.repeat(4001))).toThrow();
  });
  it('caps the active message array', () => {
    for (let index = 0; index < 110; index++)
      useChatStore.getState().prepare(`Message ${index}`);
    expect(useChatStore.getState().messages).toHaveLength(200);
  });
});
