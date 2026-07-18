import { useRef } from 'react';
import { motion, useMotionValue, useSpring, useTransform, useMotionTemplate } from 'framer-motion';
import type { ChatMessage as ChatMessageType } from '@/shared/types';
import { User, Bot } from 'lucide-react';

interface Props {
  message: ChatMessageType;
  isStreaming?: boolean;
  showMetadata?: boolean;
}

// ===== 安全渲染（HTML 转义 + Markdown） =====
const ENTITIES: Record<string, string> = {
  '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;',
};

function escapeHtml(text: string): string {
  return text.replace(/[&<>"']/g, (ch) => ENTITIES[ch] || ch);
}

function renderContent(content: string): string {
  if (!content) return '';

  const codeBlocks: string[] = [];
  let safe = content.replace(/```(\w*)\n([\s\S]*?)```/g, (_, _lang, code) => {
    codeBlocks.push(`<pre><code>${escapeHtml(code.trimEnd())}</code></pre>`);
    return `%%CODEBLOCK_${codeBlocks.length - 1}%%`;
  });

  const inlineCodes: string[] = [];
  safe = safe.replace(/`([^`]+)`/g, (_, code) => {
    inlineCodes.push(`<code>${escapeHtml(code)}</code>`);
    return `%%INLINECODE_${inlineCodes.length - 1}%%`;
  });

  safe = escapeHtml(safe);
  safe = safe.replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>');
  safe = safe.replace(/\*([^*]+)\*/g, '<em>$1</em>');
  safe = safe.replace(/^### (.+)$/gm, '<h3>$1</h3>');
  safe = safe.replace(/^## (.+)$/gm, '<h2>$1</h2>');
  safe = safe.replace(/^# (.+)$/gm, '<h1>$1</h1>');
  safe = safe.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
  safe = safe.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>');
  safe = safe.replace(/((?:^- .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map((line) => `<li>${line.replace(/^- /, '')}</li>`).join('');
    return `<ul>${items}</ul>`;
  });
  safe = safe.replace(/((?:^\d+\. .+\n?)+)/gm, (match) => {
    const items = match.trim().split('\n').map((line) => `<li>${line.replace(/^\d+\. /, '')}</li>`).join('');
    return `<ol>${items}</ol>`;
  });
  safe = safe.replace(/\n\n/g, '</p><p>');
  safe = safe.replace(/\n/g, '<br/>');
  safe = `<p>${safe}</p>`;
  safe = safe.replace(/%%CODEBLOCK_(\d+)%%/g, (_, i) => codeBlocks[parseInt(i)]);
  safe = safe.replace(/%%INLINECODE_(\d+)%%/g, (_, i) => inlineCodes[parseInt(i)]);

  return safe;
}

// ===== CometCard 风格 3D 眩光气泡壳 =====
function GlareBubble({
  isUser,
  children,
}: {
  isUser: boolean;
  children: React.ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const mouseXSpring = useSpring(x, { stiffness: 200, damping: 20 });
  const mouseYSpring = useSpring(y, { stiffness: 200, damping: 20 });

  const rotateX = useTransform(mouseYSpring, [-0.5, 0.5], ['-2deg', '2deg']);
  const rotateY = useTransform(mouseXSpring, [-0.5, 0.5], ['2deg', '-2deg']);

  const glareX = useTransform(mouseXSpring, [-0.5, 0.5], [0, 100]);
  const glareY = useTransform(mouseYSpring, [-0.5, 0.5], [0, 100]);
  const glareBg = useMotionTemplate`radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.3) 0%, rgba(255,255,255,0) 65%)`;

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    x.set((e.clientX - rect.left) / rect.width - 0.5);
    y.set((e.clientY - rect.top) / rect.height - 0.5);
  };
  const handleMouseLeave = () => { x.set(0); y.set(0); };

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        rotateX,
        rotateY,
        transformStyle: 'preserve-3d',
        perspective: 800,
      }}
      className="relative"
    >
      {children}
      {/* 眩光层 */}
      <motion.div
        className="pointer-events-none absolute inset-0 mix-blend-overlay rounded-[20px]"
        style={{
          background: glareBg,
          opacity: 0.35,
          borderBottomRightRadius: isUser ? '6px' : '20px',
          borderBottomLeftRadius: isUser ? '20px' : '6px',
        }}
      />
    </motion.div>
  );
}

// ===== ChatMessage 主组件 =====
export default function ChatMessage({ message, isStreaming }: Props) {
  const isUser = message.role === 'user';
  const hasContent = !!message.content;

  const bubbleRadius = {
    borderRadius: '20px',
    borderBottomRightRadius: isUser ? '6px' : '20px',
    borderBottomLeftRadius: isUser ? '20px' : '6px',
  };

  return (
    <div className={`flex gap-3 items-start px-4 py-2.5 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* 头像 */}
      <div
        className="flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5"
        style={{
          background: isUser ? 'var(--color-primary)' : 'var(--color-bg-secondary)',
          color: isUser ? '#fff' : 'var(--color-text-secondary)',
        }}
      >
        {isUser ? <User size={15} /> : <Bot size={15} />}
      </div>

      {/* 消息气泡 + 3D 眩光 */}
      <div className={`${isUser ? 'items-end' : 'items-start'} flex flex-col max-w-[72%] md:max-w-[60%]`}>
        <GlareBubble isUser={isUser}>
          <div
            className="px-4 py-2.5 break-words"
            style={{
              background: isUser ? 'var(--color-user-bubble)' : 'var(--color-assistant-bubble)',
              color: isUser ? 'var(--color-user-text)' : 'var(--color-assistant-text)',
              boxShadow: 'var(--shadow-bubble)',
              fontFamily: 'var(--font-body)',
              ...bubbleRadius,
            }}
          >
            {hasContent ? (
              <div
                className="message-content text-sm leading-relaxed"
                dangerouslySetInnerHTML={{ __html: renderContent(message.content) }}
              />
            ) : (
              <div className="typing-indicator">
                <span /><span /><span />
              </div>
            )}
          </div>
        </GlareBubble>

        {/* 时间戳 */}
        <div
          className="text-[10px] mt-1 px-1 select-none"
          style={{ color: 'var(--color-text-tertiary)' }}
        >
          {new Date(message.timestamp).toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}
          {isStreaming && !hasContent && (
            <span className="ml-1 opacity-60">正在思考...</span>
          )}
        </div>
      </div>
    </div>
  );
}
