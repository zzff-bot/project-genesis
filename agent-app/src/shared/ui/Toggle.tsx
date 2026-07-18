import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export function Toggle({ checked, onChange, label, disabled = false, size = 'md' }: ToggleProps) {
  const dims = size === 'sm' ? { w: 36, h: 20, d: 16 } : { w: 44, h: 24, d: 20 };

  return (
    <label className={cn('inline-flex items-center gap-2.5', disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer')}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={cn(
          'relative inline-flex items-center rounded-full transition-colors duration-200',
          'focus-visible:ring-2 focus-visible:ring-[var(--color-primary-glow)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-bg)]',
          checked ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-bg-tertiary)]',
        )}
        style={{ width: dims.w, height: dims.h }}
      >
        <motion.span
          animate={{ x: checked ? dims.w - dims.d - 2 : 2 }}
          transition={{ type: 'spring', stiffness: 550, damping: 30 }}
          className="block rounded-full bg-white shadow-sm"
          style={{ width: dims.d, height: dims.d }}
        />
      </button>
      {label && <span className="text-sm text-[var(--color-text)] select-none">{label}</span>}
    </label>
  );
}
