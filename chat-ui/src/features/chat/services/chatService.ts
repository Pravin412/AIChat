import { chatProvider } from '../../../providers';

import type { ChatRequest } from '../../../providers/types';

export const chatService = {
  send: (request: ChatRequest) => chatProvider.send(request),
  stream: (request: ChatRequest) => chatProvider.stream(request),
};
