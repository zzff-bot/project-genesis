import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import { useToastStore, type Toast } from '@/stores/toastStore';
import {
  CheckCircle,
  XCircle,
  AlertTriangle,
  Info,
  X,
} from 'lucide-react';

const iconMap = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const iconColorMap = {
  success: 'text-[var(--intent-success)]',
  error: 'text-[var(--intent-error)]',
  warning: 'text-[var(--intent-warning)]',
  info: 'text-[var(--intent-info)]',
};

const bgMap = {
  success: 'border-[var(--intent-success)]/30',
  error: 'border-[var(--intent-error)]/30',
  warning: 'border-[var(--intent-warning)]/30',
  info: 'border-[var(--intent-info)]/30',
};

// ===== 单条 Toast =====
function ToastItem({ toast: t }: { toast: Toast }) {
  const removeToast = useToastStore((s) => s.removeToast);
  const [progress, setProgress] = useState(100);
  const timerRef = useRef<ReturnType<typeof setInterval> | undefined>(undefined);
  const duration = t.duration ?? 4000;

  useEffect(() => {
    if (duration <= 0) return;

    const startTime = Date.now();
    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const remaining = Math.max(0, 100 - (elapsed / duration) * 100);
      setProgress(remaining);

      if (remaining <= 0) {
        clearInterval(timerRef.current);
        removeToast(t.id);
      }
    }, 30);

    return () => clearInterval(timerRef.current);
  }, [t.id, duration, removeToast]);

  const Icon = iconMap[t.type];

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: -12, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.95 }}
      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
      className={cn(
        'relative flex items-start gap-3 w-[380px] max-w-[calc(100vw-2rem)] px-4 py-3 rounded-xl',
        'bg-[var(--color-surface)] border shadow-lg backdrop-blur-sm',
        bgMap[t.type],
      )}
      role="alert"
    >
      <Icon size={18} className={cn('shrink-0 mt-0.5', iconColorMap[t.type])} />

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-[var(--color-text)]">{t.title}</p>
        {t.description && (
          <p className="text-xs text-[var(--color-text-secondary)] mt-0.5">
            {t.description}
          </p>
        )}
        {t.action && (
          <button
            onClick={() => {
              t.action!.onClick();
              removeToast(t.id);
            }}
            className="text-xs font-medium text-[var(--color-primary)] hover:underline mt-1.5 cursor-pointer"
          >
            {t.action.label}
          </button>
        )}
      </div>

      <button
        onClick={() => removeToast(t.id)}
        className="shrink-0 p-0.5 rounded-md text-[var(--color-text-tertiary)] hover:text-[var(--color-text)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer"
        aria-label="关闭通知"
      >
        <X size={14} />
      </button>

      {/* 进度条 */}
      {duration > 0 && (
        <div className="absolute bottom-0 left-0 right-0 h-0.5 rounded-full overflow-hidden">
          <div
            className="h-full bg-current opacity-20 transition-[width] duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </motion.div>
  );
}

// ===== Toast 容器 =====
interface ToastContainerProps {
  position?: 'top-right' | 'top-center' | 'bottom-right' | 'bottom-center';
  maxVisible?: number;
}

export function ToastContainer({
  position = 'top-right',
  maxVisible = 5,
}: ToastContainerProps) {
  const toasts = useToastStore((s) => s.toasts);
  const visibleToasts = toasts.slice(-maxVisible);

  const positionClass = {
    'top-right': 'top-4 right-4 items-end',
    'top-center': 'top-4 left-1/2 -translate-x-1/2 items-center',
    'bottom-right': 'bottom-4 right-4 items-end',
    'bottom-center': 'bottom-4 left-1/2 -translate-x-1/2 items-center',
  }[position];

  return createPortal(
    <div
      className={cn('fixed z-[9999] flex flex-col gap-2 pointer-events-none', positionClass)}
      aria-live="polite"
      aria-label="通知"
    >
      <AnimatePresence mode="popLayout">
        {visibleToasts.map((t) => (
          <div key={t.id} className="pointer-events-auto">
            <ToastItem toast={t} />
          </div>
        ))}
      </AnimatePresence>
    </div>,
    document.body,
  );
}
