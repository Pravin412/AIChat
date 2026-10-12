import { useVirtualizer } from '@tanstack/react-virtual';
import { useCallback } from 'react';

import { useAutoScroll } from '../hooks/useAutoScroll';

import { MessageBubble } from './MessageBubble';

import type { Message } from '../types';

interface MessageListProps {
  messages: Message[];
  generating: boolean;
  onEdit: (id: string) => void;
  onRegenerate: () => void;
}

export function MessageList({
  messages,
  generating,
  onEdit,
  onRegenerate,
}: MessageListProps) {
  'use no memo';
  'use no memo';
  const last = messages.at(-1);
  const { scrollRef, contentRef } = useAutoScroll(
    `${messages.length}:${last?.content.length ?? 0}`,
  );
  const getItemKey = useCallback(
    (index: number) => messages[index].id,
    [messages],
  );
  const virtual = messages.length > 100;
  // TanStack owns mutable measurements; keep this component outside compiler memoization.
  // eslint-disable-next-line react-hooks/incompatible-library
  const virtualizer = useVirtualizer({
    count: messages.length,
    getScrollElement: () => scrollRef.current,
    estimateSize: () => 240,
    getItemKey,
    overscan: 6,
    enabled: virtual,
  });
  const lastUserId = messages.findLast(
    (message) => message.role === 'user',
  )?.id;
  const lastAssistantId = messages.findLast(
    (message) => message.role === 'assistant',
  )?.id;
  const renderMessage = (message: Message) => (
    <MessageBubble
      message={message}
      canEdit={!generating && message.id === lastUserId}
      canRegenerate={!generating && message.id === lastAssistantId}
      onEdit={onEdit}
      onRegenerate={onRegenerate}
    />
  );
  return (
    <div
      className="message-scroll"
      ref={scrollRef}
      role="region"
      aria-label="Conversation messages"
      tabIndex={0}
    >
      <div
        ref={contentRef}
        className="message-list"
        style={
          virtual
            ? { height: virtualizer.getTotalSize(), position: 'relative' }
            : undefined
        }
      >
        {virtual
          ? virtualizer.getVirtualItems().map((item) => (
              <div
                key={item.key}
                data-index={item.index}
                ref={virtualizer.measureElement}
                className="virtual-message"
                style={{ transform: `translateY(${item.start}px)` }}
              >
                {renderMessage(messages[item.index])}
              </div>
            ))
          : messages.map((message) => (
              <div key={message.id}>{renderMessage(message)}</div>
            ))}
      </div>
      <div
        className="sr-only"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        {generating
          ? `Assistant replying: ${last?.content ?? ''}`
          : last?.role === 'assistant'
            ? `Assistant reply complete: ${last.content}`
            : ''}
      </div>
    </div>
  );
}
