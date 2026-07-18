import { isValidElement, type ReactNode } from 'react';
import { cn } from '@/shared/utils/cn';
import { Button } from './Button';
import type { LucideIcon } from 'lucide-react';

interface EmptyStateProps {
  icon?: LucideIcon | ReactNode;
  title: string;
  description?: string;
  action?: { label: string; onClick: () => void; variant?: 'primary' | 'secondary' };
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const sizeConfig = {
  sm: { icon: 'text-2xl', title: 'text-sm', desc: 'text-xs' },
  md: { icon: 'text-3xl', title: 'text-base', desc: 'text-sm' },
  lg: { icon: 'text-4xl', title: 'text-lg', desc: 'text-sm' },
} as const;

export function EmptyState({ icon: Icon, title, description, action, size = 'md', className }: EmptyStateProps) {
  const s = sizeConfig[size];
  // lucide-react 图标是 forwardRef 对象（typeof === 'object'），不是函数
  // 使用 createElement 避免 JSX 类型检查问题
  const renderIcon = () => {
    if (!Icon) return null;
    // lucide-react forwardRef 组件：typeof === 'object' 且有 render 属性
    if (typeof Icon === 'function' || (typeof Icon === 'object' && !isValidElement(Icon))) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const C = Icon as any;
      return <C className={s.icon} />;
    }
    return Icon;
  };

  return (
    <div className={cn('flex flex-col items-center justify-center text-center py-16 px-4', className)}>
      {Icon && (
        <div className={cn('mb-5 text-[var(--color-text-tertiary)]/60', typeof Icon !== 'string' && !isValidElement(Icon) && s.icon)}>
          {renderIcon()}
        </div>
      )}
      <h3 className={cn('font-semibold text-[var(--color-text)] mb-1.5 tracking-tight', s.title)}>{title}</h3>
      {description && (
        <p className={cn('text-[var(--color-text-secondary)] max-w-xs mb-6 leading-relaxed', s.desc)}>{description}</p>
      )}
      {action && (
        <Button variant={action.variant ?? 'primary'} size="md" onClick={action.onClick}>
          {action.label}
        </Button>
      )}
    </div>
  );
}
