import type { ChatResult } from '../../providers/types';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: number;
  status: 'complete' | 'streaming' | 'stopped' | 'error';
  result?: ChatResult;
}
