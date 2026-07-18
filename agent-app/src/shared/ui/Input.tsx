import { type InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  textarea?: boolean;
  icon?: LucideIcon;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, hint, textarea = false, icon: Icon, className, id, ...props }, ref) => {
    const inputId = id || label?.replace(/\s+/g, '-').toLowerCase();

    const inputClass = cn(
      'w-full px-3.5 py-2.5 rounded-[var(--input-radius,var(--radius-xl))] text-sm leading-relaxed',
      'bg-[var(--color-bg-secondary)] border border-transparent',
      'text-[var(--color-text)] placeholder:text-[var(--color-text-tertiary)]',
      'transition-all duration-200',
      'focus:outline-none focus:bg-[var(--color-surface)] focus:border-[var(--color-primary)]/40 focus:shadow-[0_0_0_3px_var(--color-primary-glow)]',
      error && 'border-[var(--intent-error)]/40 focus:border-[var(--intent-error)]/60 focus:shadow-[0_0_0_3px_var(--intent-error-bg)]',
      Icon && 'pl-9',
      className,
    );

    return (
      <div className="w-full">
        {label && (
          <label htmlFor={inputId} className="block text-sm font-medium text-[var(--color-text)] mb-1.5">
            {label}
          </label>
        )}

        {textarea ? (
          <div className="relative">
            {Icon && <Icon size={16} className="absolute left-3 top-3 text-[var(--color-text-tertiary)]" />}
            <textarea
              id={inputId}
              rows={3}
              className={cn(inputClass, 'resize-y min-h-[80px]')}
              {...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
            />
          </div>
        ) : (
          <div className="relative">
            {Icon && <Icon size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-text-tertiary)]" />}
            <input ref={ref} id={inputId} className={inputClass} {...props} />
          </div>
        )}

        {error && <p className="mt-1.5 text-xs text-[var(--intent-error)]">{error}</p>}
        {hint && !error && <p className="mt-1.5 text-xs text-[var(--color-text-tertiary)]">{hint}</p>}
      </div>
    );
  },
);
Input.displayName = 'Input';
