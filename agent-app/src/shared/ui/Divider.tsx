import { cn } from '@/shared/utils/cn';

interface DividerProps {
  orientation?: 'horizontal' | 'vertical';
  label?: string;
  variant?: 'full' | 'inset' | 'middle';
  className?: string;
}

/** 通用分割线 */
export function Divider({
  orientation = 'horizontal',
  label,
  variant = 'full',
  className,
}: DividerProps) {
  if (orientation === 'vertical') {
    return (
      <div
        className={cn(
          'h-full w-px bg-[var(--color-border)] self-stretch shrink-0',
          className,
        )}
        role="separator"
        aria-orientation="vertical"
      />
    );
  }

  if (label) {
    return (
      <div
        className={cn('flex items-center gap-3 w-full', className)}
        role="separator"
      >
        <span className="flex-1 h-px bg-[var(--color-border)]" />
        <span className="text-xs text-[var(--color-text-tertiary)] shrink-0 font-medium">
          {label}
        </span>
        <span className="flex-1 h-px bg-[var(--color-border)]" />
      </div>
    );
  }

  const variantClass = {
    full: 'w-full',
    inset: 'w-full ml-0',
    middle: 'w-[80%] mx-auto',
  }[variant];

  return (
    <hr
      className={cn(
        'h-px border-0 bg-[var(--color-border)]',
        variantClass,
        className,
      )}
      role="separator"
    />
  );
}
