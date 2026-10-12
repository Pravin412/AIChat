import { X } from 'lucide-react';
import { useId } from 'react';

import { useDialog } from '../hooks/useDialog';

import { IconButton } from './IconButton';

import type { ModalProps } from './Modal';

export function Drawer({ open, title, onClose, children }: ModalProps) {
  const ref = useDialog(open, onClose);
  const id = useId();
  return (
    <dialog ref={ref} aria-labelledby={id} className="drawer">
      <div className="drawer-content">
        <header className="dialog-header">
          <h2 id={id}>{title}</h2>
          <IconButton label="Close sidebar" onClick={onClose}>
            <X size={20} />
          </IconButton>
        </header>
        {children}
      </div>
    </dialog>
  );
}
