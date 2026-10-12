import { RotateCcw, TriangleAlert } from 'lucide-react';
import { useCallback, useState } from 'react';

import { Button } from '../../../shared/components/Button';
import { useChatStream } from '../hooks/useChatStream';
import { useChatStore } from '../store/chatStore';

import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import { MessageList } from './MessageList';

export function ChatWindow() {
  const messages = useChatStore((state) => state.messages);
  const generating = useChatStore((state) => state.generating);
  const error = useChatStore((state) => state.error);
  const [draft, setDraft] = useState('');
  const [editing, setEditing] = useState(false);
  const { send, stop, regenerate } = useChatStream();
  const submit = useCallback(() => {
    if (generating) return;
    if (send(draft, editing)) {
      setDraft('');
      setEditing(false);
    }
  }, [draft, editing, generating, send]);
  const edit = useCallback((id: string) => {
    const message = useChatStore
      .getState()
      .messages.find((item) => item.id === id);
    if (!message) return;
    setDraft(message.content);
    setEditing(true);
    document
      .querySelector<HTMLTextAreaElement>(
        '[aria-label="Message the assistant"]',
      )
      ?.focus();
  }, []);
  const selectPrompt = useCallback(
    (prompt: string) => {
      send(prompt);
    },
    [send],
  );
  return (
    <div className="chat-window">
      {messages.length ? (
        <MessageList
          messages={messages}
          generating={generating}
          onEdit={edit}
          onRegenerate={regenerate}
        />
      ) : (
        <EmptyState onSelect={selectPrompt} />
      )}
      {error && (
        <div role="alert" className="chat-error">
          <TriangleAlert size={18} aria-hidden="true" />
          <span>{error}</span>
          <Button onClick={draft.trim() ? submit : regenerate}>
            <RotateCcw size={16} />
            Retry
          </Button>
        </div>
      )}
      <ChatInput
        value={draft}
        onChange={setDraft}
        onSend={submit}
        onStop={stop}
        generating={generating}
        editing={editing}
        onCancelEdit={() => {
          setEditing(false);
          setDraft('');
        }}
      />
    </div>
  );
}
