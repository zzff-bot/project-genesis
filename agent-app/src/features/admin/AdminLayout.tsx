import { useState, type ReactNode } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { cn } from '@/shared/utils/cn';
import {
  LayoutDashboard, Users, Bot, MessageSquare,
  ChevronLeft, LogOut, ArrowLeftRight, Shield,
} from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: '仪表盘', end: true },
  { to: '/admin/users', icon: Users, label: '用户管理' },
  { to: '/admin/agents', icon: Bot, label: '智能体管理' },
  { to: '/admin/conversations', icon: MessageSquare, label: '对话记录' },
];

export function AdminLayout({ children }: { children: ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="flex h-screen bg-[var(--color-bg)]">
      {/* 侧栏 */}
      <motion.aside
        animate={{ width: collapsed ? 56 : 220 }}
        transition={{ type: 'spring', stiffness: 380, damping: 28 }}
        className="h-screen flex flex-col bg-[var(--color-bg-secondary)]/60 border-r border-[var(--color-border)] shrink-0 overflow-hidden"
      >
        {/* Logo */}
        <div className={cn(
          'flex items-center h-13 px-3 border-b border-[var(--color-border)]',
          collapsed ? 'justify-center' : 'gap-2',
        )}>
          <Shield size={20} className="text-[var(--color-text)] shrink-0" />
          {!collapsed && (
            <span className="font-semibold text-[13px] text-[var(--color-text)] whitespace-nowrap">管理后台</span>
          )}
        </div>

        {/* 导航 */}
        <nav className="flex-1 py-4 px-2 space-y-0.5 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => cn(
                'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm transition-all duration-200',
                isActive
                  ? 'bg-[var(--color-text)]/10 text-[var(--color-text)] font-medium'
                  : 'text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)]',
                collapsed && 'justify-center px-0',
              )}
            >
              <item.icon size={18} />
              {!collapsed && <span className="text-xs">{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        {/* 底部 */}
        <div className="p-2 border-t border-[var(--color-border)] space-y-0.5">
          <NavLink
            to="/"
            className={cn(
              'flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--color-text-secondary)] hover:bg-[var(--color-bg-secondary)] hover:text-[var(--color-text)] transition-colors',
              collapsed && 'justify-center px-0',
            )}
          >
            <ArrowLeftRight size={16} />
            {!collapsed && <span className="text-xs">返回首页</span>}
          </NavLink>

          {user && (
            <div className={cn('flex items-center gap-2 px-2 py-1.5', collapsed && 'justify-center px-0')}>
              <div className="w-6 h-6 rounded-full bg-[var(--color-text)]/10 flex items-center justify-center text-[10px] font-medium shrink-0">
                {user.username.charAt(0).toUpperCase()}
              </div>
              {!collapsed && <span className="text-xs text-[var(--color-text-secondary)] truncate">{user.username}</span>}
            </div>
          )}

          <button
            onClick={handleLogout}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--color-text-tertiary)] hover:bg-red-500/10 hover:text-red-500 transition-colors cursor-pointer',
              collapsed && 'justify-center px-0',
            )}
          >
            <LogOut size={16} />
            {!collapsed && <span className="text-xs">退出</span>}
          </button>

          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              'w-full flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-sm text-[var(--color-text-tertiary)] hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer',
              collapsed && 'justify-center px-0',
            )}
          >
            <ChevronLeft size={16} className={cn('transition-transform', collapsed && 'rotate-180')} />
          </button>
        </div>
      </motion.aside>

      {/* 内容区 */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
