import { X } from 'lucide-react';
import { useId } from 'react';

import { useDialog } from '../hooks/useDialog';

import { IconButton } from './IconButton';

import type { ReactNode } from 'react';

export interface ModalProps {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
}

export function Modal({ open, title, onClose, children }: ModalProps) {
  const ref = useDialog(open, onClose);
  const id = useId();
  return (
    <dialog ref={ref} aria-labelledby={id} className="modal">
      <div className="dialog-content">
        <header className="dialog-header">
          <h2 id={id}>{title}</h2>
          <IconButton label="Close dialog" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </header>
        {children}
      </div>
    </dialog>
  );
}
