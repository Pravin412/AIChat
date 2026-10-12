import {
  HeartPulse,
  MessageCircle,
  NotebookPen,
  Stethoscope,
} from 'lucide-react';

interface EmptyStateProps {
  onSelect: (prompt: string) => void;
}

const suggestions = [
  { icon: Stethoscope, text: 'How can I prepare for a doctor visit?' },
  { icon: NotebookPen, text: 'What should I include in a symptom diary?' },
  {
    icon: MessageCircle,
    text: 'What questions can I ask about a new medicine?',
  },
];

export function EmptyState({ onSelect }: EmptyStateProps) {
  return (
    <section
      className="empty-state chat-empty"
      aria-labelledby="welcome-heading"
    >
      <div className="welcome-symbol">
        <HeartPulse size={32} aria-hidden="true" />
      </div>
      <h1 id="welcome-heading">How can I help today?</h1>
      <p>Ask a question about your health.</p>
      <div className="suggestions">
        {suggestions.map(({ icon: Icon, text }) => (
          <button type="button" key={text} onClick={() => onSelect(text)}>
            <Icon size={19} aria-hidden="true" />
            <span>{text}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
