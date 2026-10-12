import { createHttpProvider } from './httpProvider';
import { mockProvider } from './mockProvider';

import type { ChatProvider } from './types';

function selectProvider(): ChatProvider {
  const selection = import.meta.env.VITE_CHAT_PROVIDER ?? 'mock';
  if (selection === 'mock') return mockProvider;
  if (selection === 'http') {
    const url = import.meta.env.VITE_AI_API_URL;
    if (!url)
      throw new Error('VITE_AI_API_URL is required for the HTTP provider.');
    return createHttpProvider(url);
  }
  throw new Error('VITE_CHAT_PROVIDER must be mock or http.');
}

export const chatProvider = selectProvider();
