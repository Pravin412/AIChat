import { Check, Copy, HeartPulse, Pencil, RotateCcw } from 'lucide-react';
import { lazy, memo, Suspense } from 'react';

import { IconButton } from '../../../shared/components/IconButton';
import { useCopyText } from '../../../shared/hooks/useCopyText';

import { EmergencyBanner } from './EmergencyBanner';
import { SourcesList } from './SourcesList';
import { StreamingText } from './StreamingText';

import type { Message } from '../types';

const MarkdownContent = lazy(() =>
  import('./MarkdownContent').then((module) => ({
    default: module.MarkdownContent,
  })),
);

interface MessageBubbleProps {
  message: Message;
  canEdit: boolean;
  canRegenerate: boolean;
  onEdit: (id: string) => void;
  onRegenerate: () => void;
}

export const MessageBubble = memo(function MessageBubble({
  message,
  canEdit,
  canRegenerate,
  onEdit,
  onRegenerate,
}: MessageBubbleProps) {
  const { status, copy } = useCopyText();
  const user = message.role === 'user';
  return (
    <article
      className={`message ${user ? 'message-user' : ''}`}
      aria-label={user ? 'Your message' : 'Assistant reply'}
    >
      {!user && (
        <div className="assistant-label">
          <HeartPulse size={18} aria-hidden="true" />
          <span>Health Assistant</span>
        </div>
      )}
      <div className="message-content">
        {message.result?.emergency && <EmergencyBanner />}
        {user ? (
          <p className="user-text">{message.content}</p>
        ) : message.status === 'streaming' ? (
          <StreamingText text={message.content} />
        ) : (
          <Suspense
            fallback={<p className="streaming-text">{message.content}</p>}
          >
            <MarkdownContent
              content={
                message.content ||
                (message.status === 'stopped' ? 'Reply stopped.' : '')
              }
            />
          </Suspense>
        )}
        {message.result?.needsHuman && (
          <p className="human-note">
            Please speak with a healthcare professional.
          </p>
        )}
        {message.result?.sources && (
          <SourcesList sources={message.result.sources} />
        )}
        {message.status === 'stopped' && message.content && (
          <p className="human-note">Reply stopped</p>
        )}
        {message.status !== 'streaming' && (
          <div className="message-actions">
            {message.content && (
              <IconButton
                label={status === 'copied' ? 'Message copied' : 'Copy message'}
                onClick={() => {
                  void copy(message.content);
                }}
              >
                {status === 'copied' ? <Check size={16} /> : <Copy size={16} />}
              </IconButton>
            )}
            {canEdit && (
              <IconButton
                label="Edit last message"
                onClick={() => onEdit(message.id)}
              >
                <Pencil size={16} />
              </IconButton>
            )}
            {canRegenerate && (
              <IconButton label="Regenerate last reply" onClick={onRegenerate}>
                <RotateCcw size={16} />
              </IconButton>
            )}
            {status === 'error' && (
              <span role="status">Unable to copy message.</span>
            )}
          </div>
        )}
      </div>
    </article>
  );
});
