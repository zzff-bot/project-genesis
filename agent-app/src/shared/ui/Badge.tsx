import { cn } from '@/shared/utils/cn';
import type { ReactNode } from 'react';

interface BadgeProps {
  children: ReactNode;
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'outline';
  size?: 'sm' | 'md';
  className?: string;
}

const variantClass = {
  default: 'bg-[var(--color-bg-tertiary)] text-[var(--color-text-secondary)]',
  primary: 'bg-[var(--color-primary-glow)] text-[var(--color-primary)]',
  success: 'bg-[var(--intent-success-bg)] text-[var(--intent-success)]',
  warning: 'bg-[var(--intent-warning-bg)] text-[var(--intent-warning)]',
  outline: 'bg-transparent text-[var(--color-text-secondary)] border border-[var(--color-border)]',
};

const sizeClass = { sm: 'px-2 py-0 text-[10px]', md: 'px-2.5 py-0.5 text-[11px]' };

export function Badge({ children, variant = 'default', size = 'md', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center gap-1 rounded-full font-medium tracking-wide', variantClass[variant], sizeClass[size], className)}>
      {children}
    </span>
  );
}
