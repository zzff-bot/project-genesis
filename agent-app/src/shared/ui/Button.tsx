import { type ButtonHTMLAttributes } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  iconOnly?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  loading = false,
  iconOnly = false,
  className,
  children,
  disabled,
  ...props
}: ButtonProps) {
  const baseClass =
    'inline-flex items-center justify-center gap-2 font-medium transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--color-primary-glow)] disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer select-none';

  const variantClass = {
    primary:
      'bg-[var(--color-text)] text-[var(--color-bg)] hover:opacity-90 active:scale-[0.985]',
    secondary:
      'bg-[var(--color-bg-secondary)] text-[var(--color-text)] hover:bg-[var(--color-bg-tertiary)] active:scale-[0.985]',
    ghost:
      'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] active:scale-[0.985]',
    danger:
      'bg-[var(--intent-error)] text-white hover:opacity-90 active:scale-[0.985]',
    outline:
      'text-[var(--color-text)] bg-transparent border border-[var(--color-border)] hover:bg-[var(--color-bg-secondary)] active:scale-[0.985]',
  }[variant];

  const sizeClass = iconOnly
    ? { sm: 'p-1.5 h-7 w-7', md: 'p-2 h-9 w-9', lg: 'p-2.5 h-11 w-11' }[size]
    : { sm: 'text-xs px-3 py-1.5 h-8', md: 'text-sm px-4 py-2 h-9', lg: 'text-[15px] px-5 py-2.5 h-11' }[size];

  return (
    <motion.button
      whileTap={{ scale: 0.985 }}
      className={cn(
        baseClass,
        variantClass,
        sizeClass,
        'rounded-[var(--btn-radius,var(--radius-xl))]',
        className,
      )}
      disabled={disabled || loading}
      {...(props as React.ComponentProps<typeof motion.button>)}
    >
      {loading && (
        <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
          <circle className="opacity-20" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3.5" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      )}
      {children}
    </motion.button>
  );
}
