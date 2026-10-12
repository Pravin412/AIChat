import { useCallback, useEffect, useRef } from 'react';

import {
  MAX_MESSAGE_LENGTH,
  STREAM_BATCH_MS,
} from '../../../shared/constants/limits';
import { chatService } from '../services/chatService';
import { useChatStore } from '../store/chatStore';

interface ActiveStream {
  controller: AbortController;
  assistantId: string;
  buffer: string;
  timer: ReturnType<typeof setTimeout> | null;
}

function flush(stream: ActiveStream) {
  if (stream.timer) clearTimeout(stream.timer);
  stream.timer = null;
  if (!stream.buffer) return;
  useChatStore.getState().append(stream.assistantId, stream.buffer);
  stream.buffer = '';
}

export function useChatStream() {
  const active = useRef<ActiveStream | null>(null);
  const mounted = useRef(true);
  const stop = useCallback(() => {
    const stream = active.current;
    if (!stream) return;
    active.current = null;
    stream.controller.abort();
    flush(stream);
    useChatStore.getState().stop(stream.assistantId);
  }, []);

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
      stop();
    };
  }, [stop]);

  const run = useCallback(
    async (stream: ActiveStream, text: string, replaceLast: boolean) => {
      try {
        const prepared = useChatStore.getState().prepare(text, replaceLast);
        stream.assistantId = prepared.assistantId;
        const iterator = chatService.stream({
          ...prepared.request,
          signal: stream.controller.signal,
        });
        try {
          let next = await iterator.next();
          while (
            mounted.current &&
            active.current === stream &&
            !stream.controller.signal.aborted
          ) {
            if (next.done) {
              flush(stream);
              useChatStore.getState().finish(stream.assistantId, next.value);
              break;
            }
            stream.buffer += next.value.delta;
            if (!stream.timer)
              stream.timer = setTimeout(() => {
                if (mounted.current && active.current === stream) flush(stream);
              }, STREAM_BATCH_MS);
            next = await iterator.next();
          }
        } finally {
          await iterator.return({ reply: '' });
        }
      } catch (error) {
        if (
          !mounted.current ||
          active.current !== stream ||
          stream.controller.signal.aborted
        )
          return;
        flush(stream);
        const message =
          error instanceof Error
            ? error.message
            : 'Something went wrong. Please try again.';
        if (stream.assistantId)
          useChatStore.getState().fail(stream.assistantId, message);
        else useChatStore.getState().setError(message);
      } finally {
        if (stream.timer) clearTimeout(stream.timer);
        if (active.current === stream) active.current = null;
      }
    },
    [],
  );

  const send = useCallback(
    (text: string, replaceLast = false): boolean => {
      if (!mounted.current || !text.trim()) return false;
      if (text.length > MAX_MESSAGE_LENGTH) {
        useChatStore
          .getState()
          .setError('Enter a message between 1 and 4000 characters.');
        return false;
      }
      if (!navigator.onLine) {
        useChatStore
          .getState()
          .setError('You are offline. Reconnect to send a message.');
        return false;
      }
      stop();
      const stream: ActiveStream = {
        controller: new AbortController(),
        assistantId: '',
        buffer: '',
        timer: null,
      };
      active.current = stream;
      void run(stream, text, replaceLast);
      return true;
    },
    [run, stop],
  );

  const regenerate = useCallback(() => {
    const message = useChatStore
      .getState()
      .messages.findLast((item) => item.role === 'user');
    if (message) send(message.content, true);
  }, [send]);

  return { send, stop, regenerate };
}
