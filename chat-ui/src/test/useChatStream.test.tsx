import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { useChatStream } from '../features/chat/hooks/useChatStream';
import { chatService } from '../features/chat/services/chatService';
import { useChatStore } from '../features/chat/store/chatStore';

import type { ChatChunk, ChatRequest, ChatResult } from '../providers/types';

beforeEach(() =>
  useChatStore.setState({ messages: [], generating: false, error: null }),
);
afterEach(() => vi.restoreAllMocks());

function blockedStream() {
  const signals: AbortSignal[] = [];
  vi.spyOn(chatService, 'stream').mockImplementation(async function* (
    request: ChatRequest,
  ): AsyncGenerator<ChatChunk, ChatResult> {
    const signal = request.signal;
    if (!signal) throw new Error('Missing signal');
    signals.push(signal);
    yield { delta: 'Partial response' };
    await new Promise<void>((resolve) => {
      if (signal.aborted) resolve();
      else signal.addEventListener('abort', () => resolve(), { once: true });
    });
    return { reply: 'Late result that must not be applied' };
  });
  return signals;
}

describe('useChatStream', () => {
  it('applies the authoritative final reply and emergency metadata', async () => {
    vi.spyOn(chatService, 'stream').mockImplementation(async function* () {
      yield { delta: 'Partial' };
      return {
        reply: 'Final',
        emergency: true,
        sources: ['https://example.test'],
      };
    });
    const { result } = renderHook(useChatStream);
    act(() => {
      result.current.send('Question');
    });
    await waitFor(() => expect(useChatStore.getState().generating).toBe(false));
    expect(useChatStore.getState().messages.at(-1)?.content).toBe('Final');
    expect(useChatStore.getState().messages.at(-1)?.result?.emergency).toBe(
      true,
    );
  });
  it('aborts on Stop and ignores a late completion', async () => {
    const signals = blockedStream();
    const { result } = renderHook(useChatStream);
    act(() => {
      result.current.send('Question');
    });
    await waitFor(() =>
      expect(useChatStore.getState().messages.at(-1)?.content).toBe(
        'Partial response',
      ),
    );
    act(() => result.current.stop());
    expect(signals[0].aborted).toBe(true);
    await act(async () => {
      await Promise.resolve();
    });
    expect(useChatStore.getState().messages.at(-1)?.status).toBe('stopped');
    expect(useChatStore.getState().messages.at(-1)?.content).toBe(
      'Partial response',
    );
  });
  it('aborts when unmounted mid-stream and cleans up pending updates', async () => {
    const signals = blockedStream();
    const { result, unmount } = renderHook(useChatStream);
    act(() => {
      result.current.send('Question');
    });
    unmount();
    expect(signals[0].aborted).toBe(true);
    const stopped = useChatStore.getState().messages;
    await new Promise((resolve) => setTimeout(resolve, 60));
    expect(useChatStore.getState().messages).toBe(stopped);
    expect(useChatStore.getState().generating).toBe(false);
  });
  it('aborts the previous request before a new request starts', async () => {
    const signals = blockedStream();
    const { result } = renderHook(useChatStream);
    act(() => {
      result.current.send('First');
      result.current.send('Second');
    });
    expect(signals[0].aborted).toBe(true);
    expect(signals[1].aborted).toBe(false);
    await act(async () => {
      await Promise.resolve();
    });
    expect(useChatStore.getState().generating).toBe(true);
  });
  it('reports provider errors and retries the same user turn', async () => {
    const provider = vi
      .spyOn(chatService, 'stream')
      .mockImplementation(async function* (): AsyncGenerator<
        ChatChunk,
        ChatResult
      > {
        yield { delta: '' };
        throw new Error('Assistant is unavailable');
      });
    const { result } = renderHook(useChatStream);
    act(() => {
      result.current.send('Question');
    });
    await waitFor(() =>
      expect(useChatStore.getState().error).toBe('Assistant is unavailable'),
    );
    provider.mockImplementation(async function* () {
      yield { delta: 'Retry' };
      return { reply: 'Retry complete' };
    });
    act(() => result.current.regenerate());
    await waitFor(() =>
      expect(useChatStore.getState().messages.at(-1)?.content).toBe(
        'Retry complete',
      ),
    );
    expect(useChatStore.getState().messages).toHaveLength(2);
    expect(useChatStore.getState().error).toBeNull();
  });
});
