import type { AgentConfig } from '@/shared/types';
import { VISUAL_STYLES } from '@/shared/types';
import { X, Palette, Brain, Target, Calendar, UserCircle } from 'lucide-react';

interface Props {
  agent: AgentConfig;
  onClose: () => void;
}

export default function AgentInfoPanel({ agent, onClose }: Props) {
  const styleMeta = VISUAL_STYLES.find((s) => s.id === agent.visualStyle);

  return (
    <div
      className="w-72 flex-shrink-0 border-l h-full overflow-y-auto"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      {/* 头部 */}
      <div
        className="flex items-center justify-between px-5 py-4 border-b"
        style={{ borderColor: 'var(--color-border)' }}
      >
        <h3 className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
          智能体信息
        </h3>
        <button
          onClick={onClose}
          className="p-1.5 rounded-lg transition-colors cursor-pointer"
          style={{ color: 'var(--color-text-secondary)' }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = 'var(--color-bg-secondary)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = 'transparent';
          }}
        >
          <X size={16} />
        </button>
      </div>

      <div className="p-5 space-y-6">
        {/* 名称 */}
        <section>
          <div
            className="flex items-center gap-2 mb-2 text-[11px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <BotIcon size={13} />
            名称
          </div>
          <p className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
            {agent.name}
          </p>
        </section>

        {/* 视觉风格 */}
        <section>
          <div
            className="flex items-center gap-2 mb-2 text-[11px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <Palette size={13} />
            视觉风格
          </div>
          <div className="flex items-center gap-2.5">
            <div className="flex gap-0.5">
              {styleMeta?.previewColors.map((c, i) => (
                <div
                  key={i}
                  className="w-3 h-3 rounded-full"
                  style={{ background: c }}
                />
              ))}
            </div>
            <span className="text-sm" style={{ color: 'var(--color-text)' }}>
              {styleMeta?.name}
            </span>
          </div>
        </section>

        {/* 性格 */}
        <section>
          <div
            className="flex items-center gap-2 mb-2 text-[11px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <Brain size={13} />
            性格特征
          </div>
          <div
            className="text-sm leading-relaxed p-3 rounded-xl"
            style={{
              background: 'var(--color-bg-secondary)',
              color: 'var(--color-text)',
            }}
          >
            {agent.personality}
          </div>
        </section>

        {/* 角色 */}
        {agent.character && (
          <section>
            <div
              className="flex items-center gap-2 mb-2 text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <UserCircle size={13} />
              角色定位
            </div>
            <p className="text-sm" style={{ color: 'var(--color-text)' }}>
              {agent.character}
            </p>
          </section>
        )}

        {/* 引导目的 */}
        {agent.goal && (
          <section>
            <div
              className="flex items-center gap-2 mb-2 text-[11px] font-medium uppercase tracking-wider"
              style={{ color: 'var(--color-text-tertiary)' }}
            >
              <Target size={13} />
              引导目的
            </div>
            <div
              className="text-sm leading-relaxed p-3 rounded-xl"
              style={{
                background: 'var(--color-bg-secondary)',
                color: 'var(--color-text)',
              }}
            >
              {agent.goal}
            </div>
          </section>
        )}

        {/* 创建时间 */}
        <section>
          <div
            className="flex items-center gap-2 mb-2 text-[11px] font-medium uppercase tracking-wider"
            style={{ color: 'var(--color-text-tertiary)' }}
          >
            <Calendar size={13} />
            创建时间
          </div>
          <p className="text-xs" style={{ color: 'var(--color-text-secondary)' }}>
            {new Date(agent.createdAt).toLocaleString('zh-CN')}
          </p>
        </section>
      </div>
    </div>
  );
}

// 简单 Bot 图标
function BotIcon({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="10" rx="2" />
      <circle cx="12" cy="5" r="2" />
      <path d="M12 7v4" />
      <line x1="8" y1="16" x2="8" y2="16" strokeWidth="3" />
      <line x1="16" y1="16" x2="16" y2="16" strokeWidth="3" />
    </svg>
  );
}
