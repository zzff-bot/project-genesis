import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Trash2, ArrowRight } from 'lucide-react';
import { Button, Badge } from '@/shared/ui';
import { useAgent } from '@/contexts/AgentContext';
import { CometCard } from '@/components/ui/comet-card';

export default function ConversationsPage() {
  const navigate = useNavigate();
  const { state, clearChat } = useAgent();
  const { agents, sessions } = state;

  const conversations = Object.entries(sessions)
    .filter(([, msgs]) => msgs.length > 0)
    .map(([agentId, msgs]) => {
      const agent = agents.find((a) => a.id === agentId);
      return { agentId, agent, messages: msgs, lastMsg: msgs[msgs.length - 1] };
    })
    .sort((a, b) => b.lastMsg.timestamp - a.lastMsg.timestamp);

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const formatRelativeTime = (ts: number) => {
    const diff = Date.now() - ts;
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return '刚刚';
    if (mins < 60) return `${mins} 分钟前`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours} 小时前`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days} 天前`;
    return new Date(ts).toLocaleDateString('zh-CN');
  };

  return (
    <div className="h-full overflow-y-auto">
      <div className="max-w-2xl mx-auto px-10 py-12">
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="mb-10"
        >
          <h1 className="text-3xl font-light tracking-tight text-[var(--color-text)]">
            对话记录
          </h1>
          <p className="mt-2 text-sm text-[var(--color-text-secondary)]">
            管理和回顾你的历史对话
          </p>
        </motion.div>

        {conversations.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className="flex flex-col items-center justify-center py-24"
          >
            <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6 bg-[var(--color-bg-secondary)]">
              <MessageSquare size={28} className="text-[var(--color-text-tertiary)]" />
            </div>
            <h3 className="text-lg font-medium mb-1 text-[var(--color-text)]">暂无对话记录</h3>
            <p className="text-sm mb-8 text-[var(--color-text-secondary)]">
              创建智能体后开始对话，记录将显示在这里
            </p>
            <Button onClick={() => navigate('/agents/create')}>创建智能体</Button>
          </motion.div>
        ) : (
          <div className="space-y-4">
            {conversations.map((conv, i) => (
              <motion.div
                key={conv.agentId}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05, type: 'spring', stiffness: 400, damping: 28 }}
              >
                <CometCard rotateDepth={8} translateDepth={8}>
                  <div
                    className="group flex items-center gap-4 p-4 rounded-2xl border cursor-pointer bg-[var(--color-surface)] border-[var(--color-border)] hover:border-[var(--color-primary-light)]/40 transition-colors duration-300"
                    onClick={() => navigate(`/chat/${conv.agentId}`)}
                  >
                    {/* 头像 */}
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center text-sm font-semibold shrink-0 select-none bg-[var(--color-bg-secondary)] text-[var(--color-text-secondary)]">
                      {conv.agent ? getInitial(conv.agent.name) : '?'}
                    </div>

                    {/* 中间内容 */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-sm font-medium truncate text-[var(--color-text)]">
                          {conv.agent?.name || '未知智能体'}
                        </p>
                        {conv.agent && (
                          <Badge size="sm" variant="outline">{conv.agent.visualStyle}</Badge>
                        )}
                      </div>
                      <p className="text-xs truncate text-[var(--color-text-tertiary)]">
                        {conv.lastMsg.content.slice(0, 100)}
                      </p>
                    </div>

                    {/* 右侧时间 */}
                    <div className="text-xs shrink-0 text-right text-[var(--color-text-tertiary)]">
                      {formatRelativeTime(conv.lastMsg.timestamp)}
                    </div>

                    {/* 操作按钮 */}
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                      <Button
                        variant="ghost" size="sm" iconOnly
                        onClick={(e) => { e.stopPropagation(); navigate(`/chat/${conv.agentId}`); }}
                      >
                        <ArrowRight size={15} />
                      </Button>
                      <Button
                        variant="ghost" size="sm" iconOnly
                        onClick={(e) => {
                          e.stopPropagation();
                          if (window.confirm('确定要删除此对话记录吗？')) clearChat(conv.agentId);
                        }}
                      >
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  </div>
                </CometCard>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
