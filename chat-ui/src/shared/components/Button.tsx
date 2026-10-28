import type { ButtonHTMLAttributes } from 'react';

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'danger';
};

const variants = {
  primary: 'border-accent bg-accent text-white',
  secondary: 'border-border bg-muted',
  danger: 'border-danger bg-danger text-white',
};

export function Button({
  variant = 'secondary',
  className = '',
  type = 'button',
  ...props
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`min-h-11 rounded-lg border px-4 py-2.5 font-medium ${variants[variant]} ${className}`}
      {...props}
    />
  );
}
