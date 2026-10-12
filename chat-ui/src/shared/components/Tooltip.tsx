import { useId } from 'react';

import type { ReactNode } from 'react';

interface TooltipProps {
  label: string;
  children: (descriptionId: string) => ReactNode;
}

export function Tooltip({ label, children }: TooltipProps) {
  const id = useId();
  return (
    <span className="tooltip-anchor">
      {children(id)}
      <span id={id} role="tooltip" className="tooltip">
        {label}
      </span>
    </span>
  );
}
