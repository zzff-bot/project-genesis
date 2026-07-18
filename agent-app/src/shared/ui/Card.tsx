import { type HTMLMotionProps, motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';

interface CardProps extends HTMLMotionProps<'div'> {
  hover?: boolean;
  padding?: 'none' | 'sm' | 'md' | 'lg';
}

const paddingClass = { none: 'p-0', sm: 'p-4', md: 'p-5', lg: 'p-8' } as const;

/** 精致卡片 — 微弱边框、自然 hover 抬升 */
export function Card({
  hover = true,
  padding = 'md',
  className,
  children,
  ...props
}: CardProps) {
  return (
    <motion.div
      whileHover={hover ? { y: -2, transition: { type: 'spring', stiffness: 400, damping: 25 } } : undefined}
      className={cn(
        'rounded-[var(--card-radius,var(--radius-2xl))] border border-[var(--color-border)] bg-[var(--color-surface)] transition-colors duration-200',
        hover && 'hover:border-[var(--color-primary-light)]/30 hover:shadow-md cursor-pointer',
        paddingClass[padding],
        className,
      )}
      {...props}
    >
      {children}
    </motion.div>
  );
}
