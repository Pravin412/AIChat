import { create } from 'zustand';

import {
  MAX_ACTIVE_MESSAGES,
  MAX_HISTORY_LENGTH,
  MAX_MESSAGE_LENGTH,
} from '../../../shared/constants/limits';

import type { ChatRequest, ChatResult } from '../../../providers/types';
import type { Message } from '../types';

interface PreparedRequest {
  request: ChatRequest;
  assistantId: string;
}

interface ChatState {
  conversationId: string;
  messages: Message[];
  generating: boolean;
  error: string | null;
  prepare: (text: string, replaceLast?: boolean) => PreparedRequest;
  append: (id: string, delta: string) => void;
  finish: (id: string, result: ChatResult) => void;
  stop: (id: string) => void;
  fail: (id: string, error: string) => void;
  setError: (error: string | null) => void;
}

export const useChatStore = create<ChatState>((set, get) => ({
  conversationId: crypto.randomUUID(),
  messages: [],
  generating: false,
  error: null,
  prepare(text, replaceLast = false) {
    const message = text.trim();
    if (!message || text.length > MAX_MESSAGE_LENGTH)
      throw new Error('Enter a message between 1 and 4000 characters.');
    const state = get();
    const lastUser = state.messages.findLastIndex(
      (item) => item.role === 'user',
    );
    const previous =
      replaceLast && lastUser >= 0
        ? state.messages.slice(0, lastUser)
        : state.messages;
    const history = previous
      .filter((item) => item.status === 'complete')
      .map(({ role, content }) => ({ role, content }))
      .slice(-MAX_HISTORY_LENGTH);
    const assistantId = crypto.randomUUID();
    const createdAt = Date.now();
    const messages: Message[] = [
      ...previous,
      {
        id: crypto.randomUUID(),
        role: 'user',
        content: message,
        status: 'complete',
        createdAt,
      },
      {
        id: assistantId,
        role: 'assistant',
        content: '',
        status: 'streaming',
        createdAt,
      },
    ];
    set({
      messages: messages.slice(-MAX_ACTIVE_MESSAGES),
      generating: true,
      error: null,
    });
    return {
      assistantId,
      request: {
        conversationId: state.conversationId,
        message,
        history,
        channel: 'webchat',
      },
    };
  },
  append(id, delta) {
    set((state) => ({
      messages: state.messages.map((message) =>
        message.id === id && message.status === 'streaming'
          ? { ...message, content: message.content + delta }
          : message,
      ),
    }));
  },
  finish(id, result) {
    set((state) => ({
      generating: false,
      messages: state.messages.map((message) =>
        message.id === id
          ? { ...message, content: result.reply, result, status: 'complete' }
          : message,
      ),
    }));
  },
  stop(id) {
    set((state) => ({
      generating: false,
      messages: state.messages.map((message) =>
        message.id === id && message.status === 'streaming'
          ? { ...message, status: 'stopped' }
          : message,
      ),
    }));
  },
  fail(id, error) {
    set((state) => ({
      generating: false,
      error,
      messages: state.messages.map((message) =>
        message.id === id ? { ...message, status: 'error' } : message,
      ),
    }));
  },
  setError: (error) => set({ error }),
}));
