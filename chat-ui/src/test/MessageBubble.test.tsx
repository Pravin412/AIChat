import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';

import { MessageBubble } from '../features/chat/components/MessageBubble';

import type { Message } from '../features/chat/types';

const message: Message = {
  id: 'reply',
  role: 'assistant',
  content:
    '## Sample reply\n\n| Topic | Notes |\n| --- | --- |\n| Sample | Test |\n\n```json\n{"test":true}\n```',
  createdAt: 0,
  status: 'complete',
  result: {
    reply: '',
    emergency: true,
    needsHuman: true,
    sources: ['https://example.test/source', 'javascript:alert(1)'],
  },
};

// Browser checks cover cold chunk loading; component tests wait for the actual renderer module.
beforeAll(async () => {
  await import('../features/chat/components/MarkdownContent');
});
afterEach(() => vi.unstubAllGlobals());

describe('MessageBubble', () => {
  it('renders markdown, emergency information, and safe sources', async () => {
    await act(async () => {
      render(
        <MessageBubble
          message={message}
          canEdit={false}
          canRegenerate
          onEdit={vi.fn()}
          onRegenerate={vi.fn()}
        />,
      );
    });
    expect(screen.getByRole('alert')).toHaveTextContent(
      'Seek emergency help now',
    );
    expect(
      await screen.findByRole('heading', { name: 'Sample reply' }),
    ).toBeVisible();
    expect(screen.getByRole('table')).toBeVisible();
    expect(screen.getByRole('link', { name: 'example.test' })).toHaveAttribute(
      'href',
      'https://example.test/source',
    );
    expect(
      screen.queryByRole('link', { name: /javascript/ }),
    ).not.toBeInTheDocument();
  });
  it('copies code and regenerates the reply', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    vi.stubGlobal('navigator', { ...navigator, clipboard: { writeText } });
    const regenerate = vi.fn();
    await act(async () => {
      render(
        <MessageBubble
          message={message}
          canEdit={false}
          canRegenerate
          onEdit={vi.fn()}
          onRegenerate={regenerate}
        />,
      );
    });
    fireEvent.click(await screen.findByRole('button', { name: 'Copy code' }));
    await waitFor(() =>
      expect(writeText).toHaveBeenCalledWith('{"test":true}'),
    );
    fireEvent.click(
      screen.getByRole('button', { name: 'Regenerate last reply' }),
    );
    expect(regenerate).toHaveBeenCalledOnce();
  });
  it('offers editing for the last user message', () => {
    const edit = vi.fn();
    render(
      <MessageBubble
        message={{
          ...message,
          role: 'user',
          result: undefined,
          content: 'Question',
        }}
        canEdit
        canRegenerate={false}
        onEdit={edit}
        onRegenerate={vi.fn()}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: 'Edit last message' }));
    expect(edit).toHaveBeenCalledWith('reply');
  });
});
