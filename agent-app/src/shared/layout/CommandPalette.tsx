import { useState, useEffect, useCallback, type ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bot, PlusCircle, MessageSquare, Settings, FileText, CornerDownLeft } from 'lucide-react';
import { cn } from '@/shared/utils/cn';

interface Command {
  id: string;
  label: string;
  description: string;
  icon: ReactNode;
  action: () => void;
  keywords?: string[];
}

/** Ctrl+K 全局命令面板 */
export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();

  // 全局快捷键
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey)) || (e.key === 'K' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === 'Escape' && open) {
        setOpen(false);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  const commands: Command[] = [
    {
      id: 'dashboard',
      label: '仪表盘',
      description: '返回首页',
      icon: <Search size={17} />,
      action: () => navigate('/dashboard'),
    },
    {
      id: 'create-agent',
      label: '创建智能体',
      description: '创建新的 AI 智能体',
      icon: <PlusCircle size={17} />,
      action: () => navigate('/agents/create'),
      keywords: ['new', 'agent', 'bot'],
    },
    {
      id: 'agents',
      label: '智能体市场',
      description: '浏览全部智能体',
      icon: <Bot size={17} />,
      action: () => navigate('/agents'),
    },
    {
      id: 'conversations',
      label: '对话记录',
      description: '查看历史对话',
      icon: <MessageSquare size={17} />,
      action: () => navigate('/conversations'),
    },
    {
      id: 'prompts',
      label: '提示词库',
      description: '管理提示词模板',
      icon: <FileText size={17} />,
      action: () => navigate('/prompts'),
    },
    {
      id: 'settings',
      label: '设置',
      description: '应用设置和偏好',
      icon: <Settings size={17} />,
      action: () => navigate('/settings'),
    },
  ];

  const filtered = query
    ? commands.filter(
        (c) =>
          c.label.toLowerCase().includes(query.toLowerCase()) ||
          c.description.toLowerCase().includes(query.toLowerCase()) ||
          c.keywords?.some((k) => k.toLowerCase().includes(query.toLowerCase())),
      )
    : commands;

  const executeCommand = useCallback(
    (cmd: Command) => {
      cmd.action();
      setOpen(false);
      setQuery('');
    },
    [],
  );

  useEffect(() => {
    if (!open) {
      setQuery('');
      setSelectedIndex(0);
    }
  }, [open]);

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && filtered[selectedIndex]) {
      executeCommand(filtered[selectedIndex]);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh]">
          {/* 遮罩 */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.12 }}
            className="absolute inset-0"
            style={{ background: 'rgba(0,0,0,0.3)', backdropFilter: 'blur(3px)' }}
            onClick={() => setOpen(false)}
          />

          {/* 面板 */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -6 }}
            transition={{ type: 'spring', stiffness: 500, damping: 32 }}
            className="relative w-full max-w-lg rounded-2xl overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              boxShadow: 'var(--shadow-2xl, 0 25px 50px -12px rgba(0,0,0,0.15))',
            }}
          >
            {/* 搜索框 */}
            <div
              className="flex items-center gap-3 px-4 py-3.5 border-b"
              style={{ borderColor: 'var(--color-border)' }}
            >
              <Search size={17} style={{ color: 'var(--color-text-tertiary)' }} className="shrink-0" />
              <input
                autoFocus
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setSelectedIndex(0);
                }}
                onKeyDown={onKeyDown}
                placeholder="搜索命令..."
                className="flex-1 bg-transparent text-sm outline-none"
                style={{
                  color: 'var(--color-text)',
                  fontFamily: 'var(--font-body)',
                }}
              />
              <kbd
                className="text-[10px] px-1.5 py-0.5 rounded font-medium"
                style={{
                  color: 'var(--color-text-tertiary)',
                  background: 'var(--color-bg-secondary)',
                }}
              >
                ESC
              </kbd>
            </div>

            {/* 命令列表 */}
            <div className="max-h-64 overflow-y-auto p-2">
              {filtered.length === 0 ? (
                <div className="text-sm text-center py-10" style={{ color: 'var(--color-text-tertiary)' }}>
                  没有匹配的命令
                </div>
              ) : (
                filtered.map((cmd, i) => (
                  <button
                    key={cmd.id}
                    onClick={() => executeCommand(cmd)}
                    className={cn(
                      'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors duration-150 cursor-pointer',
                    )}
                    style={{
                      background: i === selectedIndex ? 'var(--color-bg-secondary)' : 'transparent',
                      color: 'var(--color-text)',
                    }}
                    onMouseEnter={(e) => {
                      if (i !== selectedIndex) {
                        e.currentTarget.style.background = 'var(--color-bg-tertiary)';
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (i !== selectedIndex) {
                        e.currentTarget.style.background = 'transparent';
                      }
                    }}
                  >
                    <span style={{ color: 'var(--color-text-secondary)' }}>
                      {cmd.icon}
                    </span>
                    <div className="flex-1">
                      <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                        {cmd.label}
                      </p>
                      <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                        {cmd.description}
                      </p>
                    </div>
                    {i === selectedIndex && (
                      <CornerDownLeft size={14} style={{ color: 'var(--color-text-tertiary)' }} />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* 底部提示 */}
            <div
              className="px-4 py-2.5 flex gap-5 text-[11px] border-t"
              style={{
                borderColor: 'var(--color-border)',
                color: 'var(--color-text-tertiary)',
              }}
            >
              <span className="flex items-center gap-1.5">
                <kbd
                  className="text-[10px] px-1 rounded"
                  style={{ background: 'var(--color-bg-secondary)' }}
                >
                  ↑↓
                </kbd>
                导航
              </span>
              <span className="flex items-center gap-1.5">
                <kbd
                  className="text-[10px] px-1 rounded"
                  style={{ background: 'var(--color-bg-secondary)' }}
                >
                  ↵
                </kbd>
                选择
              </span>
              <span className="flex items-center gap-1.5">
                <kbd
                  className="text-[10px] px-1 rounded"
                  style={{ background: 'var(--color-bg-secondary)' }}
                >
                  ESC
                </kbd>
                关闭
              </span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
