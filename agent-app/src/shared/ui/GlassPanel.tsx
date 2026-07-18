import { type HTMLMotionProps, motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface GlassPanelProps extends HTMLMotionProps<'div'> {
  variant?: 'subtle' | 'default' | 'strong';
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClass = { none: 'p-0', sm: 'p-4', md: 'p-6', lg: 'p-10' } as const;

/** 玻璃态面板 — 克制毛玻璃效果 */
export function GlassPanel({
  variant = 'default',
  padding = 'md',
  className,
  children,
  ...props
}: GlassPanelProps) {
  const variantClass = {
    subtle: 'glass-subtle',
    default: 'glass',
    strong: 'glass-strong',
  }[variant];

  return (
    <motion.div
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className={cn(variantClass, 'rounded-[var(--modal-radius,var(--radius-2xl))]', paddingClass[padding], className)}
      {...props}
    >
      {children}
    </motion.div>
  );
}
