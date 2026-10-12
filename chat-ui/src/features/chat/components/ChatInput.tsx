import { ArrowUp, Square, X } from 'lucide-react';

import { IconButton } from '../../../shared/components/IconButton';
import { MAX_MESSAGE_LENGTH } from '../../../shared/constants/limits';
import { useAutoResizeTextarea } from '../hooks/useAutoResizeTextarea';

interface ChatInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  onStop: () => void;
  generating: boolean;
  editing: boolean;
  onCancelEdit: () => void;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  generating,
  editing,
  onCancelEdit,
}: ChatInputProps) {
  const ref = useAutoResizeTextarea(value);
  return (
    <form
      className="composer-area"
      onSubmit={(event) => {
        event.preventDefault();
        onSend();
      }}
    >
      {editing && (
        <div className="editing-bar">
          <span>Editing message</span>
          <IconButton label="Cancel edit" onClick={onCancelEdit}>
            <X size={18} />
          </IconButton>
        </div>
      )}
      <div className="composer">
        <textarea
          ref={ref}
          aria-label="Message the assistant"
          placeholder="Ask a health question..."
          rows={1}
          maxLength={MAX_MESSAGE_LENGTH}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          onKeyDown={(event) => {
            if (
              event.key === 'Enter' &&
              !event.shiftKey &&
              !event.nativeEvent.isComposing
            ) {
              event.preventDefault();
              if (!generating && value.trim()) onSend();
            }
          }}
        />
        {generating ? (
          <IconButton
            label="Stop generating"
            className="send-button"
            onClick={onStop}
          >
            <Square size={17} fill="currentColor" />
          </IconButton>
        ) : (
          <IconButton
            label={editing ? 'Send edited message' : 'Send message'}
            type="submit"
            className="send-button"
            disabled={!value.trim()}
          >
            <ArrowUp size={21} />
          </IconButton>
        )}
      </div>
      <div className="composer-footer">
        <span>AI assistant, not a substitute for a doctor</span>
        <span
          aria-label={`${value.length} of ${MAX_MESSAGE_LENGTH} characters`}
        >
          {value.length}/{MAX_MESSAGE_LENGTH}
        </span>
      </div>
    </form>
  );
}
