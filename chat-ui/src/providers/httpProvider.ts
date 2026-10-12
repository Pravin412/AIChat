import { checkAbort } from '../shared/utils/abort';

import { friendlyHttpError, isRecord, ProviderError } from './providerErrors';
import { parseSse } from './sseParser';
import { parseResult, requestBody } from './validation';

import type { ChatProvider, ChatRequest } from './types';

async function checkResponse(response: Response): Promise<void> {
  if (response.ok) return;
  let code = `HTTP_${response.status}`;
  try {
    const body: unknown = await response.json();
    if (
      isRecord(body) &&
      isRecord(body.error) &&
      typeof body.error.code === 'string'
    ) {
      code = body.error.code;
    }
  } catch {
    /* A non-JSON error still maps to its friendly status message. */
  }
  throw new ProviderError(
    friendlyHttpError(response.status),
    code,
    response.status,
  );
}

export function createHttpProvider(baseUrl: string): ChatProvider {
  const endpoint = baseUrl.replace(/\/+$/, '');
  async function post(path: string, request: ChatRequest): Promise<Response> {
    checkAbort(request.signal);
    const body = JSON.stringify(requestBody(request));
    let response: Response;
    try {
      response = await fetch(`${endpoint}/v1/chat${path}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Accept: path ? 'text/event-stream' : 'application/json',
        },
        body,
        signal: request.signal,
      });
    } catch (error) {
      checkAbort(request.signal);
      if (error instanceof ProviderError) throw error;
      throw new ProviderError(
        'Unable to connect. Check your connection and try again.',
        'NETWORK_ERROR',
      );
    }
    await checkResponse(response);
    checkAbort(request.signal);
    return response;
  }
  return {
    async send(request) {
      const response = await post('', request);
      const data: unknown = await response.json();
      checkAbort(request.signal);
      return parseResult(data);
    },
    async *stream(request) {
      const response = await post('/stream', request);
      if (
        !response.body ||
        !response.headers.get('content-type')?.includes('text/event-stream')
      ) {
        await response.body?.cancel();
        throw new ProviderError(
          'The assistant returned an invalid stream.',
          'INVALID_STREAM',
        );
      }
      for await (const event of parseSse(response.body, request.signal)) {
        checkAbort(request.signal);
        if (!['delta', 'done', 'error'].includes(event.event)) continue;
        let data: unknown;
        try {
          data = JSON.parse(event.data);
        } catch {
          throw new ProviderError(
            'The assistant returned an invalid stream.',
            'INVALID_STREAM',
          );
        }
        if (event.event === 'done') return parseResult(data);
        if (event.event === 'error') {
          throw new ProviderError(
            isRecord(data) && typeof data.message === 'string'
              ? data.message
              : 'The assistant encountered an error.',
            'STREAM_ERROR',
          );
        }
        if (!isRecord(data) || typeof data.delta !== 'string') {
          throw new ProviderError(
            'The assistant returned an invalid stream.',
            'INVALID_STREAM',
          );
        }
        yield { delta: data.delta };
      }
      throw new ProviderError(
        'The assistant stream ended before completion. Please retry.',
        'INCOMPLETE_STREAM',
      );
    },
  };
}
