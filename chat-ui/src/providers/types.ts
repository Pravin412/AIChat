export interface ChatRequest {
  conversationId: string;
  message: string;
  history: { role: 'user' | 'assistant'; content: string }[];
  channel: 'webchat';
  signal?: AbortSignal;
}

export interface ChatChunk {
  delta: string;
}

export interface ChatResult {
  reply: string;
  needsHuman?: boolean;
  emergency?: boolean;
  sources?: string[];
}

export interface ChatProvider {
  send(request: ChatRequest): Promise<ChatResult>;
  stream(request: ChatRequest): AsyncGenerator<ChatChunk, ChatResult>;
}
