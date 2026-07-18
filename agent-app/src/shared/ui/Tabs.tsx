import { createContext, useContext, type ReactNode } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';

// ===== Context =====
interface TabsContextValue {
  value: string;
  onValueChange: (value: string) => void;
  variant: 'underline' | 'pills' | 'segmented';
  size: 'sm' | 'md';
}
const TabsContext = createContext<TabsContextValue | null>(null);
function useTabs() {
  const ctx = useContext(TabsContext);
  if (!ctx) throw new Error('Tabs must be used within <Tabs>');
  return ctx;
}

// ===== Root =====
interface TabsProps {
  value: string;
  onValueChange: (value: string) => void;
  variant?: 'underline' | 'pills' | 'segmented';
  size?: 'sm' | 'md';
  children: ReactNode;
  className?: string;
}
export function Tabs({ value, onValueChange, variant = 'underline', size = 'md', children, className }: TabsProps) {
  return (
    <TabsContext.Provider value={{ value, onValueChange, variant, size }}>
      <div className={cn('w-full', className)}>{children}</div>
    </TabsContext.Provider>
  );
}

// ===== List =====
interface TabsListProps { children: ReactNode; className?: string; }
function TabsList({ children, className }: TabsListProps) {
  const { variant } = useTabs();
  const variantClass = {
    underline: 'gap-0 border-b border-[var(--color-border)]',
    pills: 'gap-1 p-1 bg-[var(--color-bg-secondary)] rounded-xl',
    segmented: 'gap-0 p-0.5 bg-[var(--color-bg-secondary)] rounded-lg',
  }[variant];
  return <div className={cn('flex items-center', variantClass, className)} role="tablist">{children}</div>;
}

// ===== Tab =====
interface TabProps {
  value: string;
  children: ReactNode;
  disabled?: boolean;
  icon?: LucideIcon;
  badge?: string | number;
  className?: string;
}
function Tab({ value, children, disabled = false, icon: Icon, badge, className }: TabProps) {
  const { value: activeValue, onValueChange, variant, size } = useTabs();
  const isActive = activeValue === value;

  const sizeClass = size === 'sm' ? 'text-xs px-3 py-1.5' : 'text-[13px] px-3.5 py-2';

  const variantClass = {
    underline: cn(
      'relative pb-2.5 px-3',
      isActive ? 'text-[var(--color-text)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]',
    ),
    pills: cn(
      'rounded-lg',
      isActive ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs border border-[var(--color-border)]' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]',
    ),
    segmented: cn(
      'rounded-md',
      isActive ? 'bg-[var(--color-surface)] text-[var(--color-text)] shadow-xs' : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text)]',
    ),
  }[variant];

  return (
    <button
      role="tab"
      aria-selected={isActive}
      disabled={disabled}
      onClick={() => onValueChange(value)}
      className={cn(
        'relative flex items-center gap-1.5 font-medium transition-colors duration-200',
        'focus-visible:ring-2 focus-visible:ring-[var(--color-primary-glow)] rounded-md',
        'disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer',
        sizeClass, variantClass, className,
      )}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 15} />}
      {children}
      {badge !== undefined && (
        <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 text-[10px] font-semibold rounded-full bg-[var(--color-primary-glow)] text-[var(--color-primary)]">
          {badge}
        </span>
      )}
      {variant === 'underline' && isActive && (
        <motion.div
          layoutId="tab-indicator"
          className="absolute bottom-0 left-0 right-0 h-[1.5px] bg-[var(--color-text)] rounded-full"
          transition={{ type: 'spring', stiffness: 500, damping: 30 }}
        />
      )}
    </button>
  );
}

// ===== Content =====
interface TabsContentProps { value: string; children: ReactNode; className?: string; }
function TabsContent({ value, children, className }: TabsContentProps) {
  const { value: activeValue } = useTabs();
  if (value !== activeValue) return null;
  return (
    <motion.div
      initial={{ opacity: 0, y: 3 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.2 }}
      className={cn('pt-4', className)}
      role="tabpanel"
    >
      {children}
    </motion.div>
  );
}

Tabs.List = TabsList;
Tabs.Tab = Tab;
Tabs.Content = TabsContent;
