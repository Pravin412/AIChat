import { Tooltip } from './Tooltip';

import type { ButtonHTMLAttributes } from 'react';

export type IconButtonProps = Omit<
  ButtonHTMLAttributes<HTMLButtonElement>,
  'aria-label'
> & { label: string };

export function IconButton({
  label,
  className = '',
  type = 'button',
  ...props
}: IconButtonProps) {
  return (
    <Tooltip label={label}>
      {(id) => (
        <button
          type={type}
          className={`inline-flex size-11 shrink-0 items-center justify-center rounded-lg ${className || 'hover:bg-muted'}`}
          aria-label={label}
          aria-describedby={id}
          {...props}
        />
      )}
    </Tooltip>
  );
}
