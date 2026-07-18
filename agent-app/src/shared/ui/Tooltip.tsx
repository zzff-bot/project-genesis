import { cn } from '@/shared/utils/cn';
import { useState, useRef, useCallback, type ReactNode, type ReactElement, cloneElement } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface TooltipProps {
  content: ReactNode;
  children: ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  delay?: number;
  disabled?: boolean;
  className?: string;
}

const positionMap = {
  top:    { x: '-50%', y: '-100%', margin: '-6px 0 0 0' },
  bottom: { x: '-50%', y: '100%',  margin: '6px 0 0 0'  },
  left:   { x: '-100%', y: '-50%', margin: '0 0 0 -6px' },
  right:  { x: '100%',  y: '-50%', margin: '0 0 0 6px'  },
} as const;

export function Tooltip({ content, children, position = 'top', delay = 350, disabled = false, className }: TooltipProps) {
  const [show, setShow] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const triggerRef = useRef<HTMLElement | null>(null);

  const showTooltip = useCallback(() => {
    if (disabled) return;
    timeoutRef.current = setTimeout(() => setShow(true), delay);
  }, [delay, disabled]);

  const hideTooltip = useCallback(() => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setShow(false);
  }, []);

  const pos = positionMap[position];
  const childProps = children.props as Record<string, unknown>;

  const trigger = cloneElement(children as ReactElement<Record<string, unknown>>, {
    ref: (el: HTMLElement | null) => { triggerRef.current = el; },
    onMouseEnter: (e: React.MouseEvent) => { if (typeof childProps.onMouseEnter === 'function') childProps.onMouseEnter(e); showTooltip(); },
    onMouseLeave: (e: React.MouseEvent) => { if (typeof childProps.onMouseLeave === 'function') childProps.onMouseLeave(e); hideTooltip(); },
    onFocus: (e: React.FocusEvent) => { if (typeof childProps.onFocus === 'function') childProps.onFocus(e); showTooltip(); },
    onBlur: (e: React.FocusEvent) => { if (typeof childProps.onBlur === 'function') childProps.onBlur(e); hideTooltip(); },
  });

  const tooltip = (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.94 }}
          transition={{ duration: 0.15 }}
          className={cn(
            'fixed z-[100] px-3 py-1.5 rounded-lg text-xs font-medium pointer-events-none',
            'bg-[var(--color-text)] text-[var(--color-bg)] shadow-lg',
            'max-w-[240px] text-center leading-relaxed',
            className,
          )}
          style={{
            left: triggerRef.current ? triggerRef.current.getBoundingClientRect().left + triggerRef.current.offsetWidth / 2 : 0,
            top: triggerRef.current ? triggerRef.current.getBoundingClientRect().top + triggerRef.current.offsetHeight / 2 : 0,
            transform: `translate(${pos.x}, calc(${pos.y} + ${pos.margin.match(/-?\d+/)?.[0] ?? 0}px))`,
          }}
        >
          {content}
        </motion.div>
      )}
    </AnimatePresence>
  );

  return <>{trigger}{createPortal(tooltip, document.body)}</>;
}
