import {
  MAX_HISTORY_LENGTH,
  MAX_MESSAGE_LENGTH,
} from '../shared/constants/limits';

import { isRecord, ProviderError } from './providerErrors';

import type { ChatRequest, ChatResult } from './types';

export function requestBody(request: ChatRequest): Omit<ChatRequest, 'signal'> {
  if (
    !request.conversationId.trim() ||
    !request.message.trim() ||
    request.message.length > MAX_MESSAGE_LENGTH ||
    request.history.length > MAX_HISTORY_LENGTH ||
    request.channel !== 'webchat'
  ) {
    throw new ProviderError(
      'Please check your message and try again.',
      'INVALID_REQUEST',
      422,
    );
  }
  return {
    conversationId: request.conversationId,
    message: request.message,
    history: request.history,
    channel: 'webchat',
  };
}

export function parseResult(value: unknown): ChatResult {
  if (
    !isRecord(value) ||
    typeof value.reply !== 'string' ||
    typeof value.needsHuman !== 'boolean' ||
    typeof value.emergency !== 'boolean' ||
    !Array.isArray(value.sources) ||
    !value.sources.every((source: unknown) => typeof source === 'string')
  ) {
    throw new ProviderError(
      'The assistant returned an invalid response.',
      'INVALID_RESPONSE',
    );
  }
  return {
    reply: value.reply,
    needsHuman: value.needsHuman,
    emergency: value.emergency,
    sources: value.sources as string[],
  };
}
