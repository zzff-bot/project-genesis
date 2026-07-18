import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Bot, PlusCircle, MessageSquare,
  FileText, Database, GitBranch, Settings,
  ChevronLeft, Sun, Moon, Monitor,
} from 'lucide-react';
import { useSettings } from '@/shared/hooks/useSettings';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

const mainNav: NavItem[] = [
  { to: '/', icon: LayoutDashboard, label: '首页', end: true },
  { to: '/agents', icon: Bot, label: '智能体', end: true },
  { to: '/agents/create', icon: PlusCircle, label: '创建' },
  { to: '/conversations', icon: MessageSquare, label: '对话' },
];

const advancedNav: NavItem[] = [
  { to: '/prompts', icon: FileText, label: '提示词' },
  { to: '/knowledge', icon: Database, label: '知识库' },
  { to: '/workflows', icon: GitBranch, label: '工作流' },
];

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

export function Sidebar({ collapsed, onToggleCollapse }: SidebarProps) {
  const { themeMode, setThemeMode } = useSettings();

  const cycleTheme = () => {
    const modes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const current = modes.indexOf(themeMode);
    setThemeMode(modes[(current + 1) % 3]);
  };

  const ThemeIcon = themeMode === 'dark' ? Moon : themeMode === 'light' ? Sun : Monitor;

  return (
    <motion.aside
      animate={{ width: collapsed ? 60 : 220 }}
      transition={{ type: 'spring', stiffness: 380, damping: 28 }}
      className="h-screen flex flex-col bg-[var(--color-bg)] border-r border-[var(--color-border)] shrink-0 overflow-hidden"
    >
      {/* Logo — 极简 */}
      <div className={cn(
        'flex items-center h-13 px-3 border-b border-[var(--color-border)]',
        collapsed ? 'justify-center' : 'gap-2.5',
      )}>
        <div className="w-7 h-7 rounded-lg bg-[var(--color-text)] flex items-center justify-center shrink-0">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="var(--color-bg)" strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="3" />
            <circle cx="12" cy="12" r="9" strokeWidth="1.5" opacity="0.4" />
          </svg>
        </div>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-semibold text-[13px] text-[var(--color-text)] tracking-tight whitespace-nowrap"
          >
            Genesis
          </motion.span>
        )}
      </div>

      {/* 导航 */}
      <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
        <NavSection items={mainNav} collapsed={collapsed} />
        <div className="my-3 mx-2.5 border-t border-[var(--color-border)]" />
        <NavSection items={advancedNav} collapsed={collapsed} />
      </nav>

      {/* 底部操作 */}
      <div className="p-2 border-t border-[var(--color-border)] space-y-0.5">
        <button
          onClick={cycleTheme}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] transition-colors cursor-pointer',
            collapsed && 'justify-center px-0',
          )}
          title={`主题: ${themeMode === 'dark' ? '深色' : themeMode === 'light' ? '浅色' : '自动'}`}
        >
          <ThemeIcon size={18} />
          {!collapsed && <span className="text-xs">{themeMode === 'dark' ? '深色' : themeMode === 'light' ? '浅色' : '自动'}</span>}
        </button>

        <NavLink
          to="/settings"
          className={({ isActive }) => cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-colors',
            isActive ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text)]' : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]',
            collapsed && 'justify-center px-0',
          )}
        >
          <Settings size={18} />
          {!collapsed && <span className="text-xs">设置</span>}
        </NavLink>

        <button
          onClick={onToggleCollapse}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer',
            collapsed && 'justify-center px-0',
          )}
        >
          <ChevronLeft size={18} className={cn('transition-transform duration-300', collapsed && 'rotate-180')} />
        </button>
      </div>
    </motion.aside>
  );
}

function NavSection({ items, collapsed }: { items: NavItem[]; collapsed: boolean }) {
  return (
    <>
      {items.map((item) => (
        <NavLink
          key={item.to}
          to={item.to}
          end={item.end}
          className={({ isActive }) => cn(
            'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200',
            isActive
              ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text)] font-medium'
              : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]',
            collapsed && 'justify-center px-0',
          )}
        >
          <item.icon size={18} />
          {!collapsed && <span className="text-xs">{item.label}</span>}
        </NavLink>
      ))}
    </>
  );
}
