import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Bot,
  PlusCircle,
  MessageSquare,
  TrendingUp,
  Zap,
  ArrowUpRight,
  Trash2,
} from 'lucide-react';
import { Card, Button, Badge, EmptyState } from '@/shared/ui';
import { useAgent } from '@/contexts/AgentContext';
import type { AgentConfig } from '@/shared/types';

// ===== 动画预设 =====
const springFade = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  transition: { type: 'spring' as const, stiffness: 400, damping: 30 },
};

const springStagger = (i: number) => ({
  ...springFade,
  transition: { ...springFade.transition, delay: 0.04 * i },
});

// ===== 主要页面 =====
export default function DashboardPage() {
  const navigate = useNavigate();
  const { state, removeAgent } = useAgent();
  const { agents, sessions } = state;

  const totalConversations = Object.values(sessions).filter(
    (m) => m.length > 0,
  ).length;
  const totalMessages = Object.values(sessions).reduce(
    (sum, m) => sum + m.length,
    0,
  );

  // ===== 统计数据 =====
  const stats = [
    { icon: Bot, label: '智能体', value: agents.length },
    { icon: MessageSquare, label: '对话', value: totalConversations },
    { icon: TrendingUp, label: '消息', value: totalMessages },
    { icon: Zap, label: '可用模板', value: 6 },
  ];

  // ===== 最近对话 =====
  const recentConversations = Object.entries(sessions)
    .filter(([, msgs]) => msgs.length > 0)
    .slice(0, 5)
    .map(([agentId, msgs]) => ({
      agentId,
      agent: agents.find((a) => a.id === agentId),
      lastMsg: msgs[msgs.length - 1],
      count: msgs.length,
    }));

  const hasContent = agents.length > 0 || recentConversations.length > 0;

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-5xl mx-auto px-6 py-12 md:px-8 md:py-16 lg:py-20">
        {/* ===== Hero 标题 ===== */}
        <motion.header {...springFade} className="mb-16">
          <h1 className="text-[2rem] md:text-[2.5rem] lg:text-[3rem] font-bold text-[var(--color-text)] leading-none tracking-[-0.025em]">
            仪表盘
          </h1>
          <p className="mt-3 text-[15px] text-[var(--color-text-secondary)] max-w-lg leading-relaxed">
            管理你的 AI 智能体，追踪对话动态
          </p>
        </motion.header>

        {/* ===== 统计卡片行 ===== */}
        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            delay: 0.08,
          }}
          className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-20"
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] px-5 py-6"
            >
              <stat.icon
                size={16}
                className="text-[var(--color-text-tertiary)] mb-4"
              />
              <p className="text-[1.75rem] font-bold text-[var(--color-text)] leading-none tracking-[-0.01em]">
                {stat.value}
              </p>
              <p className="mt-1.5 text-[13px] text-[var(--color-text-secondary)]">
                {stat.label}
              </p>
            </div>
          ))}
        </motion.section>

        {/* ===== 智能体区域 ===== */}
        <motion.section
          key={agents.length}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            type: 'spring',
            stiffness: 400,
            damping: 30,
            delay: 0.12,
          }}
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-[var(--color-text)] tracking-[-0.01em]">
                你的智能体
              </h2>
              <p className="mt-1 text-[13px] text-[var(--color-text-secondary)]">
                {agents.length === 0
                  ? '创建你的第一个智能体'
                  : `${agents.length} 个智能体`}
              </p>
            </div>
            <Button size="sm" onClick={() => navigate('/agents/create')}>
              <PlusCircle size={15} />
              创建
            </Button>
          </div>

          {agents.length === 0 ? (
            <Card hover={false} padding="lg">
              <EmptyState
                icon={Bot}
                title="还没有智能体"
                description="创建你的第一个 AI 智能体，开启对话之旅"
                size="lg"
                action={{
                  label: '创建智能体',
                  onClick: () => navigate('/agents/create'),
                }}
              />
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {agents.map((agent, i) => (
                <motion.div key={agent.id} {...springStagger(i)}>
                  <AgentCard
                    agent={agent}
                    messageCount={sessions[agent.id]?.length || 0}
                    onClick={() => navigate(`/chat/${agent.id}`)}
                    onDelete={(e) => {
                      e.stopPropagation();
                      if (confirm(`确定删除「${agent.name}」吗？对话记录也会被清除。`)) {
                        removeAgent(agent.id);
                      }
                    }}
                  />
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        {/* ===== 底部区域：最近对话 + 快捷操作 ===== */}
        {hasContent && (
          <motion.section
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 30,
              delay: 0.2,
            }}
            className="mt-20"
          >
            <h2 className="text-lg font-semibold text-[var(--color-text)] mb-5 tracking-[-0.01em]">
              最近动态
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* 最近对话列表 */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h3 className="text-[13px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
                  最近对话
                </h3>
                {recentConversations.length === 0 ? (
                  <p className="text-[13px] text-[var(--color-text-tertiary)] py-2">
                    暂无对话记录
                  </p>
                ) : (
                  <ul className="space-y-0.5">
                    {recentConversations.map(
                      ({ agentId, agent, lastMsg, count }) => (
                        <li key={agentId}>
                          <button
                            onClick={() => navigate(`/chat/${agentId}`)}
                            className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors cursor-pointer group"
                          >
                            <div className="flex-1 min-w-0 text-left">
                              <p className="text-sm font-medium text-[var(--color-text)] truncate">
                                {agent?.name || '未知智能体'}
                              </p>
                              <p className="text-[12px] text-[var(--color-text-tertiary)] truncate mt-0.5">
                                {lastMsg?.content.slice(0, 50) || '空对话'}
                                {' · '}
                                {count} 条消息
                              </p>
                            </div>
                            <ArrowUpRight
                              size={14}
                              className="text-[var(--color-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-3"
                            />
                          </button>
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </div>

              {/* 快捷操作 */}
              <div className="rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                <h3 className="text-[13px] font-medium text-[var(--color-text-secondary)] uppercase tracking-wider mb-4">
                  快捷操作
                </h3>
                <div className="space-y-0.5">
                  <QuickAction
                    icon={PlusCircle}
                    label="创建智能体"
                    onClick={() => navigate('/agents/create')}
                  />
                  <QuickAction
                    icon={Bot}
                    label="浏览市场"
                    onClick={() => navigate('/agents')}
                  />
                  <QuickAction
                    icon={MessageSquare}
                    label="全部对话"
                    onClick={() => navigate('/conversations')}
                  />
                </div>
              </div>
            </div>
          </motion.section>
        )}
      </div>
    </div>
  );
}

// ===== 智能体卡片 =====
function AgentCard({
  agent,
  messageCount,
  onClick,
  onDelete,
}: {
  agent: AgentConfig;
  messageCount: number;
  onClick: () => void;
  onDelete: (e: React.MouseEvent) => void;
}) {
  return (
    <Card onClick={onClick} padding="md" className="group relative">
      <div className="flex items-start gap-3.5">
        <div className="w-9 h-9 rounded-xl bg-[var(--color-bg-secondary)] flex items-center justify-center shrink-0">
          <span className="text-sm font-semibold text-[var(--color-text-secondary)]">
            {agent.name.charAt(0)}
          </span>
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-[var(--color-text)] truncate">
              {agent.name}
            </p>
            <Badge variant="outline" size="sm">
              {agent.visualStyle}
            </Badge>
          </div>
          <p className="text-[12px] text-[var(--color-text-tertiary)] mt-1 leading-relaxed line-clamp-2">
            {agent.personality.slice(0, 60)}
          </p>
          <p className="text-[11px] text-[var(--color-text-tertiary)] mt-2">
            {messageCount} 条消息
          </p>
        </div>
      </div>

      {/* 删除按钮 — hover 时浮现 */}
      <button
        onClick={onDelete}
        className="absolute top-3 right-3 p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity text-[var(--color-text-tertiary)] hover:text-[var(--intent-error)] hover:bg-[var(--intent-error-bg)] cursor-pointer"
        title="删除智能体"
      >
        <Trash2 size={14} />
      </button>
    </Card>
  );
}

// ===== 快捷操作项 =====
function QuickAction({
  icon: Icon,
  label,
  onClick,
}: {
  icon: typeof PlusCircle;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-[var(--color-bg-secondary)] transition-colors text-left cursor-pointer group"
    >
      <Icon
        size={17}
        className="text-[var(--color-text-tertiary)] group-hover:text-[var(--color-text-secondary)] transition-colors shrink-0"
      />
      <span className="text-sm font-medium text-[var(--color-text)]">
        {label}
      </span>
    </button>
  );
}
