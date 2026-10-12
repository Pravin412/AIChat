import { abortableDelay, checkAbort } from '../shared/utils/abort';

import { requestBody } from './validation';

import type { ChatProvider, ChatRequest, ChatResult } from './types';

function makeReply(request: ChatRequest): ChatResult {
  requestBody(request);
  if (/chest pain/i.test(request.message)) {
    return {
      reply:
        '## Seek urgent help\n\nChest pain can be a medical emergency. Contact your local emergency services immediately, especially with trouble breathing, sweating, or faintness.\n\nDo not wait for a chat response or drive yourself.',
      emergency: true,
      needsHuman: true,
      sources: ['https://www.nhs.uk/conditions/chest-pain/'],
    };
  }
  return {
    reply: [
      "## Let's take it one step at a time",
      'This is a **sample response** from the mock assistant. A clinician can help you understand symptoms in your own context.',
      '### Useful things to note',
      '- When the symptoms started\n- What makes them better or worse\n- Medicines or supplements you take',
      '| Topic | What to record |\n| --- | --- |\n| Timing | Start date and duration |\n| Changes | Better, worse, or unchanged |',
      'A simple example for keeping notes:',
      '```json\n{ "symptom": "sample", "duration": "2 days" }\n```',
      'What would you like to explore next?',
    ].join('\n\n'),
    emergency: false,
    needsHuman: false,
    sources: ['https://www.nhs.uk/'],
  };
}

export const mockProvider: ChatProvider = {
  async send(request) {
    const result = makeReply(request);
    await abortableDelay(350, request.signal);
    checkAbort(request.signal);
    return result;
  },
  async *stream(request) {
    const result = makeReply(request);
    await abortableDelay(250, request.signal);
    for (const delta of result.reply.match(/\S+\s*|\s+/g) ?? []) {
      await abortableDelay(22, request.signal);
      checkAbort(request.signal);
      yield { delta };
    }
    checkAbort(request.signal);
    return result;
  },
};
