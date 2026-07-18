import { cn } from '@/shared/utils/cn';

interface SkeletonProps {
  variant?: 'text' | 'circular' | 'rectangular' | 'card';
  width?: string | number;
  height?: string | number;
  animate?: boolean;
  lines?: number;
  className?: string;
}

export function Skeleton({ variant = 'text', width, height, animate = true, lines = 1, className }: SkeletonProps) {
  const baseClass = 'bg-[var(--color-bg-tertiary)] rounded-md relative overflow-hidden';

  const shimmerStyle = animate ? {
    backgroundImage: 'linear-gradient(90deg, var(--color-bg-tertiary) 25%, var(--color-surface) 50%, var(--color-bg-tertiary) 75%)',
    backgroundSize: '200% 100%',
    animation: 'shimmer 2s ease-in-out infinite',
  } : undefined;

  if (variant === 'circular') {
    const size = width ?? height ?? 40;
    return <div className={cn(baseClass, 'rounded-full shrink-0', className)} style={{ width: size, height: size, ...shimmerStyle }} aria-hidden="true" />;
  }

  if (variant === 'card') {
    return (
      <div className={cn('rounded-xl border border-[var(--color-border)] p-5 space-y-3', className)} aria-hidden="true">
        <div className="flex items-center gap-3">
          <div className={cn(baseClass, 'rounded-full w-10 h-10 shrink-0')} style={shimmerStyle} />
          <div className="flex-1 space-y-2">
            <div className={cn(baseClass, 'h-3 rounded w-2/3')} style={shimmerStyle} />
            <div className={cn(baseClass, 'h-3 rounded w-1/2')} style={shimmerStyle} />
          </div>
        </div>
      </div>
    );
  }

  if (variant === 'rectangular') {
    return <div className={cn(baseClass, 'rounded-lg', className)} style={{ width: width ?? '100%', height: height ?? 120, ...shimmerStyle }} aria-hidden="true" />;
  }

  return (
    <div className={cn('space-y-2', className)} aria-hidden="true">
      {Array.from({ length: lines }).map((_, i) => (
        <div key={i} className={cn(baseClass, 'h-3 rounded', i === lines - 1 && 'w-2/3')} style={{ width: width ?? (i === lines - 1 ? undefined : '100%'), height, ...shimmerStyle }} />
      ))}
    </div>
  );
}
