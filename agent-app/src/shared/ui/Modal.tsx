import { useEffect, type ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { X } from 'lucide-react';
import { Button } from './Button';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children?: ReactNode;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'confirm';
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm?: () => void;
  danger?: boolean;
  footer?: ReactNode;
}

export function Modal({
  open, onClose, title, children, className, size = 'md',
  variant = 'default', description, confirmLabel = '确认',
  cancelLabel = '取消', onConfirm, danger = false, footer,
}: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  const sizeClass = { sm: 'max-w-sm', md: 'max-w-lg', lg: 'max-w-2xl' }[size];

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: 8 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            className={cn(
              'relative w-full bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[var(--modal-radius,var(--radius-2xl))] shadow-2xl overflow-hidden',
              sizeClass,
              className,
            )}
          >
            {variant === 'confirm' ? (
              <>
                <div className="px-6 py-6">
                  {title && <h2 className="text-lg font-semibold text-[var(--color-text)] mb-2">{title}</h2>}
                  {description && <p className="text-sm text-[var(--color-text-secondary)] leading-relaxed">{description}</p>}
                  {children}
                </div>
                <div className="flex justify-end gap-3 px-6 pb-6">
                  <Button variant="secondary" size="sm" onClick={onClose}>{cancelLabel}</Button>
                  <Button variant={danger ? 'danger' : 'primary'} size="sm" onClick={() => { onConfirm?.(); onClose(); }}>{confirmLabel}</Button>
                </div>
              </>
            ) : (
              <>
                {title && (
                  <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-border)]">
                    <h2 className="text-base font-semibold text-[var(--color-text)]">{title}</h2>
                    <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)] transition-colors cursor-pointer">
                      <X size={18} />
                    </button>
                  </div>
                )}
                <div className="px-6 py-5">{children}</div>
                {footer && <div className="px-6 pb-5">{footer}</div>}
              </>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
