/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CHAT_PROVIDER?: 'mock' | 'http';
  readonly VITE_AI_API_URL?: string;
}
