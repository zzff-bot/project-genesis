import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAgent } from '@/contexts/AgentContext';
import ChatMessage from './components/ChatMessage';
import ChatInput from './components/ChatInput';
import AgentInfoPanel from './components/AgentInfoPanel';
import { ArrowLeft, Info, Trash2, Eye, EyeOff, Sparkles, User } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AgentMode } from '@/shared/types';

export default function ChatPage() {
  const { agentId } = useParams<{ agentId: string }>();
  const navigate = useNavigate();
  const { state, selectAgent, sendMsg, clearChat, getAgent, updateAgent } = useAgent();

  const [showInfo, setShowInfo] = useState(false);
  const [mode, setMode] = useState<AgentMode>('character');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  const agent = agentId ? getAgent(agentId) : undefined;
  const messages = agentId ? state.sessions[agentId] || [] : [];

  // 进入页面时加载数据
  useEffect(() => {
    if (agentId && state.activeAgentId !== agentId) {
      selectAgent(agentId);
    }
  }, [agentId]);

  // 自动滚动到底部
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, state.isStreaming]);

  // 如果智能体不存在，重定向回首页
  useEffect(() => {
    if (agentId && state.agents.length > 0 && !agent) {
      navigate('/');
    }
  }, [agent, state.agents, agentId, navigate]);

  // 流式输出时阻止页面关闭/刷新
  useEffect(() => {
    if (!state.isStreaming) return;
    const handler = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = '';
    };
    window.addEventListener('beforeunload', handler);
    return () => window.removeEventListener('beforeunload', handler);
  }, [state.isStreaming]);

  // 带守卫的返回
  const handleBack = () => {
    if (state.isStreaming && !confirm('正在接收回复，确定要离开吗？')) {
      return;
    }
    navigate('/');
  };

  const handleSend = async (content: string) => {
    await sendMsg(content);
  };

  const handleClearChat = () => {
    if (confirm('确定要清空当前对话历史吗？')) {
      if (agentId) clearChat(agentId);
    }
  };

  const themeClass = agent ? `theme-${agent.visualStyle}` : 'theme-modern';
  const isProfessional = mode === 'professional';

  return (
    <div
      className={`h-full flex flex-col ${themeClass}`}
      style={{
        background: 'var(--color-bg)',
        fontFamily: 'var(--font-body)',
        color: 'var(--color-text)',
      }}
    >
      {/* ================================================================
          Header — 极简，玻璃质感，克制信息密度
          ================================================================ */}
      <header
        className="flex items-center justify-between px-5 py-3 flex-shrink-0 glass-subtle z-10"
        style={{ borderBottom: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center gap-3 min-w-0">
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'var(--color-bg-secondary)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleBack}
            className="p-2 rounded-xl cursor-pointer flex-shrink-0"
            style={{ color: 'var(--color-text-tertiary)' }}
            title="返回"
            aria-label="返回"
          >
            <ArrowLeft size={18} strokeWidth={1.5} />
          </motion.button>

          {agent ? (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="flex items-center gap-2.5 min-w-0"
            >
              <span
                className="w-2 h-2 rounded-full flex-shrink-0"
                style={{
                  background: 'var(--color-primary)',
                  boxShadow: '0 0 6px var(--color-primary-glow)',
                }}
              />
              <h1
                className="text-sm font-semibold tracking-tight truncate"
                style={{ color: 'var(--color-text)' }}
              >
                {agent.name}
              </h1>
              {isProfessional && (
                <span
                  className="text-[10px] font-semibold px-1.5 py-0.5 rounded-full tracking-wide flex-shrink-0"
                  style={{
                    background: 'var(--color-primary-glow)',
                    color: 'var(--color-primary)',
                  }}
                >
                  PRO
                </span>
              )}
            </motion.div>
          ) : (
            <span className="text-sm" style={{ color: 'var(--color-text-tertiary)' }}>
              加载中...
            </span>
          )}
        </div>

        <div className="flex items-center gap-0.5 flex-shrink-0">
          <ModeToggle mode={mode} onChange={setMode} />

          {/* 真人模式开关 */}
          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'var(--color-bg-secondary)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              if (!agent || !agentId) return;
              updateAgent(agentId, { humanLike: !agent.humanLike });
            }}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            style={{
              background: agent?.humanLike ? 'var(--color-primary-glow)' : 'transparent',
              color: agent?.humanLike ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
            }}
            title={agent?.humanLike ? '真人模式：开' : '真人模式：关'}
          >
            <User size={13} strokeWidth={2} />
            真人
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'var(--color-bg-secondary)' }}
            whileTap={{ scale: 0.95 }}
            onClick={handleClearChat}
            className="p-2 rounded-xl cursor-pointer"
            style={{ color: 'var(--color-text-tertiary)' }}
            title="清空对话"
            aria-label="清空对话"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.05, backgroundColor: 'var(--color-bg-secondary)' }}
            whileTap={{ scale: 0.95 }}
            onClick={() => setShowInfo(!showInfo)}
            className="p-2 rounded-xl cursor-pointer"
            style={{
              color: showInfo ? 'var(--color-primary)' : 'var(--color-text-tertiary)',
            }}
            title="智能体信息"
            aria-label="智能体信息"
          >
            <Info size={16} strokeWidth={1.5} />
          </motion.button>
        </div>
      </header>

      {/* ================================================================
          Professional Mode 技术信息栏 — 精致紧凑
          ================================================================ */}
      <AnimatePresence>
        {isProfessional && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 400, damping: 32 }}
            className="overflow-hidden flex-shrink-0"
          >
            <div
              className="flex items-center gap-2 px-5 py-2 text-[11px] border-b"
              style={{
                background: 'var(--color-bg-secondary)',
                borderColor: 'var(--color-border)',
              }}
            >
              {[
                { label: '模型', value: 'deepseek-chat' },
                { label: 'Temp', value: '0.7' },
                { label: 'Tokens', value: `~${estimateTokens(messages)}` },
                { label: '消息', value: String(messages.length) },
              ].map(({ label, value }) => (
                <span key={label} className="flex items-center gap-1.5 flex-shrink-0">
                  <span style={{ color: 'var(--color-text-tertiary)' }}>{label}</span>
                  <span
                    className="font-medium tracking-tight"
                    style={{ color: 'var(--color-text)' }}
                  >
                    {value}
                  </span>
                </span>
              ))}

              {state.isStreaming && (
                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="ml-auto flex items-center gap-1.5 flex-shrink-0"
                  style={{ color: 'var(--color-primary)' }}
                >
                  <span
                    className="w-1.5 h-1.5 rounded-full"
                    style={{
                      background: 'var(--color-primary)',
                      boxShadow: '0 0 6px var(--color-primary-glow)',
                    }}
                  />
                  流式传输中
                </motion.span>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ================================================================
          主体：消息区 + 侧边栏
          ================================================================ */}
      <div className="flex flex-1 overflow-hidden">
        {/* 消息列表 */}
        <div
          ref={messagesContainerRef}
          className="flex-1 overflow-y-auto"
          style={{ background: 'var(--color-bg)' }}
        >
          {messages.length === 0 ? (
            /* ── 欢迎界面：大留白、居中、优雅排版 ── */
            <div className="flex flex-col items-center justify-center h-full px-6 text-center">
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: 'spring', stiffness: 280, damping: 28, delay: 0.05 }}
                className="flex flex-col items-center"
              >
                {/* 品牌标识 */}
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 24, delay: 0.1 }}
                  className="w-16 h-16 rounded-2xl flex items-center justify-center mb-7"
                  style={{
                    background: 'var(--color-primary-glow)',
                    color: 'var(--color-primary)',
                    boxShadow: 'var(--shadow-glow)',
                  }}
                >
                  <Sparkles size={28} strokeWidth={1.5} />
                </motion.div>

                {/* 标题 */}
                <motion.h2
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.2 }}
                  className="text-xl font-semibold mb-2.5 tracking-tight"
                  style={{ color: 'var(--color-text)' }}
                >
                  开始与 {agent?.name || '智能体'} 对话
                </motion.h2>

                {/* 副标题 */}
                <motion.p
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.3 }}
                  className="text-sm max-w-xs leading-relaxed"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  {agent?.goal
                    ? `我会在对话中自然地引导你：${agent.goal}`
                    : '我是你定制的专属智能体，有什么想聊的都可以告诉我'}
                </motion.p>

                {/* 快捷提示 */}
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 28, delay: 0.4 }}
                  className="flex flex-col items-center gap-2 mt-9"
                >
                  {[
                    '你好，请介绍一下你自己',
                    '你能帮我做什么？',
                    '我们聊点什么有趣的话题吧',
                  ].map((hint) => (
                    <motion.button
                      key={hint}
                      whileHover={{
                        scale: 1.02,
                        y: -1,
                        borderColor: 'var(--color-border)',
                        backgroundColor: 'var(--color-surface)',
                        boxShadow: 'var(--shadow-sm)',
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleSend(hint)}
                      className="px-5 py-2.5 rounded-full text-sm cursor-pointer w-full max-w-[280px]"
                      style={{
                        background: 'var(--color-bg-secondary)',
                        color: 'var(--color-text-secondary)',
                        border: '1px solid transparent',
                      }}
                    >
                      {hint}
                    </motion.button>
                  ))}
                </motion.div>
              </motion.div>
            </div>
          ) : (
            /* ── 消息列表 ── */
            <div className="max-w-3xl mx-auto py-6 px-2 sm:px-4">
              {messages.map((msg, i) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    type: 'spring',
                    stiffness: 350,
                    damping: 28,
                    delay: Math.min(i * 0.02, 0.3),
                  }}
                >
                  <ChatMessage
                    message={msg}
                    isStreaming={
                      state.isStreaming && msg.role === 'assistant' && !msg.content
                    }
                    showMetadata={isProfessional}
                  />
                </motion.div>
              ))}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ── 错误提示：精致卡片 ── */}
          <AnimatePresence>
            {state.error && (
              <motion.div
                initial={{ opacity: 0, y: 8, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 8, scale: 0.98 }}
                transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                className="max-w-2xl mx-auto px-4 sm:px-6 pb-4"
              >
                <div
                  className="flex items-start gap-3 p-4 rounded-2xl text-sm"
                  style={{
                    background: 'var(--intent-error-bg)',
                    color: 'var(--intent-error)',
                    border: '1px solid rgba(239, 68, 68, 0.12)',
                  }}
                >
                  <span
                    className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-xs font-bold mt-0.5"
                    style={{
                      background: 'var(--intent-error)',
                      color: '#fff',
                    }}
                  >
                    !
                  </span>
                  <span className="leading-relaxed">{state.error}</span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* 侧边栏 — 保持不变 */}
        <AnimatePresence>
          {showInfo && agent && (
            <AgentInfoPanel agent={agent} onClose={() => setShowInfo(false)} />
          )}
        </AnimatePresence>
      </div>

      {/* 底部输入区 */}
      <ChatInput
        onSend={handleSend}
        isStreaming={state.isStreaming}
        disabled={!agent}
      />
    </div>
  );
}

/** ================================================================
 *  模式切换按钮 — 精致 Pill 切换
 *  ================================================================ */
function ModeToggle({
  mode,
  onChange,
}: {
  mode: AgentMode;
  onChange: (m: AgentMode) => void;
}) {
  const isProfessional = mode === 'professional';

  return (
    <motion.button
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      onClick={() => onChange(isProfessional ? 'character' : 'professional')}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[11px] font-medium tracking-tight cursor-pointer"
      style={{
        background: isProfessional
          ? 'var(--color-primary)'
          : 'var(--color-bg-secondary)',
        color: isProfessional ? '#ffffff' : 'var(--color-text-tertiary)',
        border: isProfessional ? 'none' : '1px solid var(--color-border)',
      }}
      title={isProfessional ? '切换到角色模式' : '切换到专业模式'}
      aria-label={isProfessional ? '切换到角色模式' : '切换到专业模式'}
    >
      <motion.span
        animate={{ rotate: isProfessional ? 0 : 180 }}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        {isProfessional ? <Eye size={13} strokeWidth={1.5} /> : <EyeOff size={13} strokeWidth={1.5} />}
      </motion.span>
      {isProfessional ? '专业' : '角色'}
    </motion.button>
  );
}

/** 粗略估算 Token 数（中文 ~1.5 字符/token，英文 ~4 字符/token） */
function estimateTokens(messages: { content: string }[]): number {
  const totalChars = messages.reduce((sum, m) => sum + m.content.length, 0);
  return Math.ceil(totalChars / 2.5);
}
