interface StreamingTextProps {
  text: string;
}

export function StreamingText({ text }: StreamingTextProps) {
  return (
    <div className="streaming-text" aria-busy="true">
      {text || 'Thinking...'}
      <span className="stream-cursor" aria-hidden="true" />
    </div>
  );
}
