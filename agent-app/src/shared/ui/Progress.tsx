import { cn } from '@/shared/utils/cn';

interface ProgressProps {
  value: number;
  max?: number;
  variant?: 'default' | 'success' | 'warning' | 'error';
  size?: 'sm' | 'md' | 'lg';
  showLabel?: boolean;
  indeterminate?: boolean;
  className?: string;
}

const heightMap = { sm: 'h-1', md: 'h-2', lg: 'h-3' } as const;

const variantColorMap = {
  default: 'var(--color-primary)',
  success: 'var(--intent-success)',
  warning: 'var(--intent-warning)',
  error: 'var(--intent-error)',
} as const;

const labelColorMap = {
  default: 'text-[var(--color-text-secondary)]',
  success: 'text-[var(--intent-success)]',
  warning: 'text-[var(--intent-warning)]',
  error: 'text-[var(--intent-error)]',
} as const;

/** 进度条 */
export function Progress({
  value,
  max = 100,
  variant = 'default',
  size = 'md',
  showLabel = false,
  indeterminate = false,
  className,
}: ProgressProps) {
  const pct = Math.min(Math.max((value / max) * 100, 0), 100);
  const fillColor = variantColorMap[variant];

  return (
    <div className={cn('w-full', className)}>
      <div
        className={cn(
          'w-full rounded-full bg-[var(--color-bg-tertiary)] overflow-hidden',
          heightMap[size],
        )}
        role="progressbar"
        aria-valuenow={indeterminate ? undefined : value}
        aria-valuemin={0}
        aria-valuemax={max}
        aria-label={showLabel ? `${Math.round(pct)}%` : undefined}
      >
        <div
          className={cn(
            'h-full rounded-full transition-all duration-500 ease-out',
            heightMap[size],
            indeterminate && 'animate-[indeterminate-progress_2s_ease-in-out_infinite]',
          )}
          style={{
            width: indeterminate ? undefined : `${pct}%`,
            backgroundColor: fillColor,
          }}
        />
      </div>
      {showLabel && (
        <span className={cn('text-xs mt-1 inline-block', labelColorMap[variant])}>
          {indeterminate ? '处理中…' : `${Math.round(pct)}%`}
        </span>
      )}
    </div>
  );
}

// ===== StatusBar =====

interface StatusBarProps {
  status: 'idle' | 'loading' | 'success' | 'error' | 'warning';
  label?: string;
  detail?: string;
  className?: string;
}

const statusDotMap = {
  idle: 'bg-[var(--color-text-tertiary)]',
  loading: 'bg-[var(--color-primary)] animate-pulse',
  success: 'bg-[var(--intent-success)]',
  error: 'bg-[var(--intent-error)]',
  warning: 'bg-[var(--intent-warning)]',
} as const;

const statusBorderMap = {
  idle: 'border-[var(--color-border)]',
  loading: 'border-[var(--color-primary)]',
  success: 'border-[var(--intent-success)]',
  error: 'border-[var(--intent-error)]',
  warning: 'border-[var(--intent-warning)]',
} as const;

/** 状态指示条 */
export function StatusBar({ status, label, detail, className }: StatusBarProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-2.5 px-3 py-2 rounded-lg border text-sm',
        statusBorderMap[status],
        'bg-[var(--color-surface)]',
        className,
      )}
    >
      <span className={cn('w-2 h-2 rounded-full shrink-0', statusDotMap[status])} />
      {label && (
        <span className="text-[var(--color-text)] font-medium">{label}</span>
      )}
      {detail && (
        <span className="text-[var(--color-text-tertiary)] text-xs">{detail}</span>
      )}
    </div>
  );
}
