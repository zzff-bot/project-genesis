import {
  useState,
  useRef,
  useEffect,
  createContext,
  useContext,
  type ReactNode,
  type ReactElement,
  cloneElement,
} from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';
import { Divider } from './Divider';

// ===== Dropdown Context =====
interface DropdownContextValue {
  open: boolean;
  setOpen: (open: boolean) => void;
  triggerRef: React.RefObject<HTMLElement | null>;
}

const DropdownContext = createContext<DropdownContextValue | null>(null);

function useDropdown() {
  const ctx = useContext(DropdownContext);
  if (!ctx) throw new Error('Dropdown components must be used within <Dropdown>');
  return ctx;
}

// ===== Dropdown Root =====
interface DropdownProps {
  trigger: ReactElement;
  children: ReactNode;
  align?: 'start' | 'center' | 'end';
  side?: 'top' | 'bottom';
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
}

export function Dropdown({
  trigger,
  children,
  align = 'center',
  side = 'bottom',
  open: controlledOpen,
  onOpenChange,
  className,
}: DropdownProps) {
  const [internalOpen, setInternalOpen] = useState(false);
  const open = controlledOpen ?? internalOpen;
  const setOpen = onOpenChange ?? setInternalOpen;
  const triggerRef = useRef<HTMLElement | null>(null);

  const close = () => setOpen(false);

  // 点击外部关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: MouseEvent) => {
      if (triggerRef.current && !triggerRef.current.contains(e.target as Node)) {
        close();
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [open]);

  // Escape 关闭
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open]);

  const triggerProps = trigger.props as Record<string, unknown>;
  const triggerEl = cloneElement(trigger as ReactElement<Record<string, unknown>>, {
    ref: (el: HTMLElement | null) => {
      triggerRef.current = el;
    },
    onClick: (e: React.MouseEvent) => {
      if (typeof triggerProps.onClick === 'function') triggerProps.onClick(e);
      setOpen(!open);
    },
    'aria-expanded': open,
    'aria-haspopup': 'menu' as const,
  });

  const positionStyle = (): React.CSSProperties => {
    if (!triggerRef.current) return {};
    const rect = triggerRef.current.getBoundingClientRect();

    const top =
      side === 'bottom' ? rect.bottom + 4 : rect.top - 4;
    const left =
      align === 'start'
        ? rect.left
        : align === 'end'
          ? rect.right
          : rect.left + rect.width / 2;

    const transform =
      align === 'center'
        ? 'translateX(-50%)'
        : align === 'end'
          ? 'translateX(-100%)'
          : '';

    return {
      position: 'fixed',
      top: side === 'top' ? undefined : top,
      bottom: side === 'top' ? window.innerHeight - top : undefined,
      left,
      transform,
      zIndex: 100,
    };
  };

  return (
    <DropdownContext.Provider value={{ open, setOpen, triggerRef }}>
      {triggerEl}
      {createPortal(
        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: side === 'bottom' ? -4 : 4 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: side === 'bottom' ? -4 : 4 }}
              transition={{ type: 'spring', stiffness: 450, damping: 28 }}
              style={positionStyle()}
              className={cn(
                'min-w-[180px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-xl shadow-lg py-1 overflow-hidden',
                className,
              )}
              role="menu"
            >
              {children}
            </motion.div>
          )}
        </AnimatePresence>,
        document.body,
      )}
    </DropdownContext.Provider>
  );
}

// ===== Dropdown.Item =====
interface DropdownItemProps {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
  danger?: boolean;
  icon?: LucideIcon;
  shortcut?: string;
  className?: string;
}

function DropdownItem({
  children,
  onClick,
  disabled = false,
  danger = false,
  icon: Icon,
  shortcut,
  className,
}: DropdownItemProps) {
  const { setOpen } = useDropdown();

  return (
    <button
      role="menuitem"
      disabled={disabled}
      onClick={() => {
        if (!disabled) {
          onClick?.();
          setOpen(false);
        }
      }}
      className={cn(
        'flex items-center gap-2.5 w-full px-3.5 py-2 text-sm transition-colors duration-100 text-left cursor-pointer',
        disabled && 'opacity-40 cursor-not-allowed',
        danger
          ? 'text-[var(--intent-error)] hover:bg-[var(--intent-error-bg)]'
          : 'text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)]',
        className,
      )}
    >
      {Icon && <Icon size={16} />}
      <span className="flex-1">{children}</span>
      {shortcut && (
        <span className="text-xs text-[var(--color-text-tertiary)] ml-4">
          {shortcut}
        </span>
      )}
    </button>
  );
}

// ===== Dropdown.Separator =====
function DropdownSeparator({ className }: { className?: string }) {
  return <Divider className={cn('my-1', className)} />;
}

// Attach compound components
Dropdown.Item = DropdownItem;
Dropdown.Separator = DropdownSeparator;
