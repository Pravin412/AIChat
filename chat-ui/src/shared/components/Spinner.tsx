interface SpinnerProps {
  label?: string;
}

export function Spinner({ label = 'Loading' }: SpinnerProps) {
  return (
    <span role="status" className="spinner">
      <span className="sr-only">{label}</span>
    </span>
  );
}
