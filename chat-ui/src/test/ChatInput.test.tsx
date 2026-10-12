import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ChatInput } from '../features/chat/components/ChatInput';

function setup(generating = false) {
  const onSend = vi.fn();
  const onStop = vi.fn();
  render(
    <ChatInput
      value="Hello"
      onChange={vi.fn()}
      onSend={onSend}
      onStop={onStop}
      generating={generating}
      editing={false}
      onCancelEdit={vi.fn()}
    />,
  );
  return {
    onSend,
    onStop,
    input: screen.getByRole('textbox', { name: 'Message the assistant' }),
  };
}

describe('ChatInput', () => {
  it('sends on Enter', () => {
    const { input, onSend } = setup();
    fireEvent.keyDown(input, { key: 'Enter' });
    expect(onSend).toHaveBeenCalledOnce();
  });
  it('preserves Shift+Enter and IME composition', () => {
    const { input, onSend } = setup();
    fireEvent.keyDown(input, { key: 'Enter', shiftKey: true });
    fireEvent.keyDown(input, { key: 'Enter', isComposing: true });
    expect(onSend).not.toHaveBeenCalled();
  });
  it('stops generation without sending another message', () => {
    const { input, onSend, onStop } = setup(true);
    fireEvent.keyDown(input, { key: 'Enter' });
    fireEvent.click(screen.getByRole('button', { name: 'Stop generating' }));
    expect(onSend).not.toHaveBeenCalled();
    expect(onStop).toHaveBeenCalledOnce();
  });
});
