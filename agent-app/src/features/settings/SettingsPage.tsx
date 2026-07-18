import { motion } from 'framer-motion';
import { Sun, Moon, Monitor, Download, Trash2 } from 'lucide-react';
import { Button } from '@/shared/ui';
import { useSettings } from '@/shared/hooks/useSettings';
import type { ThemeMode } from '../../stores/settingsStore';

const themeOptions: { mode: ThemeMode; icon: typeof Sun; label: string; desc: string }[] = [
  { mode: 'light', icon: Sun, label: '浅色模式', desc: '始终使用浅色主题' },
  { mode: 'dark', icon: Moon, label: '深色模式', desc: '始终使用深色主题' },
  { mode: 'auto', icon: Monitor, label: '跟随系统', desc: '自动切换深浅色' },
];

export default function SettingsPage() {
  const { themeMode, setThemeMode } = useSettings();

  const handleExportData = () => {
    const data: Record<string, unknown> = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key) {
        try {
          data[key] = JSON.parse(localStorage.getItem(key) || '');
        } catch {
          data[key] = localStorage.getItem(key);
        }
      }
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `agent-app-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (window.confirm('确定要清除所有数据吗？此操作不可撤销。')) {
      localStorage.clear();
      window.location.reload();
    }
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-xl mx-auto px-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="mb-12"
        >
          <h1 className="text-3xl font-light tracking-tight" style={{ color: 'var(--color-text)' }}>
            设置
          </h1>
          <p className="mt-2 text-sm" style={{ color: 'var(--color-text-secondary)' }}>
            管理应用偏好和数据
          </p>
        </motion.div>

        {/* 外观 */}
        <section className="mb-10">
          <h2
            className="text-xs font-medium uppercase tracking-widest mb-4 px-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            外观
          </h2>
          <div
            className="rounded-2xl border overflow-hidden"
            style={{
              background: 'var(--color-surface)',
              borderColor: 'var(--color-border)',
            }}
          >
            {themeOptions.map((opt, i) => (
              <button
                key={opt.mode}
                onClick={() => setThemeMode(opt.mode)}
                className="w-full flex items-center gap-4 px-5 py-4 transition-colors cursor-pointer text-left"
                style={{
                  background: themeMode === opt.mode ? 'var(--color-bg-secondary)' : 'transparent',
                  borderBottom: i < themeOptions.length - 1 ? '1px solid var(--color-border)' : 'none',
                }}
              >
                <div
                  className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
                  style={{
                    background: themeMode === opt.mode ? 'var(--color-primary)' : 'var(--color-bg-tertiary)',
                    color: themeMode === opt.mode ? 'white' : 'var(--color-text-secondary)',
                  }}
                >
                  <opt.icon size={18} />
                </div>
                <div className="flex-1 text-left">
                  <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                    {opt.label}
                  </p>
                  <p className="text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    {opt.desc}
                  </p>
                </div>
                {/* 选中指示器 */}
                <div
                  className="w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors"
                  style={{
                    borderColor: themeMode === opt.mode ? 'var(--color-primary)' : 'var(--color-border)',
                  }}
                >
                  {themeMode === opt.mode && (
                    <motion.div
                      layoutId="theme-radio-dot"
                      className="w-2.5 h-2.5 rounded-full"
                      style={{ background: 'var(--color-primary)' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    />
                  )}
                </div>
              </button>
            ))}
          </div>
        </section>

        {/* 数据管理 */}
        <section>
          <h2
            className="text-xs font-medium uppercase tracking-widest mb-4 px-1"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            数据管理
          </h2>
          <div className="space-y-3">
            {/* 导出数据 */}
            <div
              className="flex items-center justify-between p-5 rounded-2xl border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
                  导出数据
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  将智能体配置和对话记录导出为 JSON
                </p>
              </div>
              <Button variant="secondary" size="sm" onClick={handleExportData}>
                <Download size={14} />
                导出
              </Button>
            </div>

            {/* 清除数据 */}
            <div
              className="flex items-center justify-between p-5 rounded-2xl border"
              style={{
                background: 'var(--color-surface)',
                borderColor: 'var(--color-border)',
              }}
            >
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--intent-error)' }}>
                  清除所有数据
                </p>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-tertiary)' }}>
                  删除所有智能体和对话记录，此操作不可撤销
                </p>
              </div>
              <Button variant="danger" size="sm" onClick={handleClearData}>
                <Trash2 size={14} />
                清除
              </Button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
