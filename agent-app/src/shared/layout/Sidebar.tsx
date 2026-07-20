import { NavLink } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Bot, PlusCircle, MessageSquare,
  FileText, Database, GitBranch, Settings,
  ChevronLeft, Sun, Moon, Monitor,
  Shield, LogOut,
} from 'lucide-react';
import { useSettings } from '@/shared/hooks/useSettings';
import { useAuthStore } from '@/stores/authStore';

interface NavItem {
  to: string;
  icon: LucideIcon;
  label: string;
  end?: boolean;
}

const mainNav: NavItem[] = [
  { to: '/dashboard', icon: LayoutDashboard, label: '首页', end: true },
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
  const { user, logout } = useAuthStore();
  const isAdmin = user?.role === 'admin';

  const cycleTheme = () => {
    const modes: Array<'light' | 'dark' | 'auto'> = ['light', 'dark', 'auto'];
    const current = modes.indexOf(themeMode);
    setThemeMode(modes[(current + 1) % 3]);
  };

  const ThemeIcon = themeMode === 'dark' ? Moon : themeMode === 'light' ? Sun : Monitor;

  const handleLogout = () => {
    logout();
  };

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

        {/* 管理后台入口（仅管理员可见） */}
        {isAdmin && (
          <>
            <div className="my-3 mx-2.5 border-t border-[var(--color-border)]" />
            <NavLink
              to="/admin"
              end
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200',
                isActive
                  ? 'bg-[var(--color-bg-secondary)] text-[var(--color-text)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]',
                collapsed && 'justify-center px-0',
              )}
            >
              <Shield size={18} />
              {!collapsed && <span className="text-xs">管理后台</span>}
            </NavLink>
          </>
        )}

        <div className="my-3 mx-2.5 border-t border-[var(--color-border)]" />
        <NavSection items={advancedNav} collapsed={collapsed} />
      </nav>

      {/* 底部操作 */}
      <div className="p-2 border-t border-[var(--color-border)] space-y-0.5">
        {/* 用户信息 */}
        {user && (
          <div className={cn(
            'flex items-center gap-2 px-2 py-1.5 mb-1',
            collapsed && 'justify-center px-0',
          )}>
            <div className="w-7 h-7 rounded-full bg-[var(--color-bg-secondary)] flex items-center justify-center text-[11px] font-medium text-[var(--color-text)] shrink-0">
              {user.username.charAt(0).toUpperCase()}
            </div>
            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs text-[var(--color-text)] truncate">
                  {user.username}
                </p>
                <p className="text-[10px] text-[var(--color-text-tertiary)] truncate">
                  {isAdmin ? '管理员' : '用户'}
                </p>
              </div>
            )}
          </div>
        )}

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

        {/* 退出登录 */}
        <button
          onClick={handleLogout}
          className={cn(
            'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--color-text-tertiary)] hover:bg-[var(--intent-error-bg)]/30 hover:text-[var(--intent-error)] transition-colors cursor-pointer',
            collapsed && 'justify-center px-0',
          )}
          title="退出登录"
        >
          <LogOut size={18} />
          {!collapsed && <span className="text-xs">退出</span>}
        </button>

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
