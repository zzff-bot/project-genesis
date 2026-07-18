import { useState, useRef, useEffect, type KeyboardEvent } from 'react';
import { Send, Loader2 } from 'lucide-react';

interface Props {
  onSend: (content: string) => void;
  isStreaming: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, isStreaming, disabled }: Props) {
  const [input, setInput] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // 自动调整高度
  useEffect(() => {
    const ta = textareaRef.current;
    if (ta) {
      ta.style.height = 'auto';
      ta.style.height = Math.min(ta.scrollHeight, 150) + 'px';
    }
  }, [input]);

  // 发送后自动聚焦
  useEffect(() => {
    if (!isStreaming) {
      textareaRef.current?.focus();
    }
  }, [isStreaming]);

  const handleSend = () => {
    const trimmed = input.trim();
    if (!trimmed || isStreaming || disabled) return;
    onSend(trimmed);
    setInput('');
    // 重置高度
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Enter 发送，Shift+Enter 换行
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div
      className="border-t px-4 py-4"
      style={{
        background: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-3xl mx-auto flex items-end gap-3">
        {/* 输入框 - pill 风格 */}
        <div
          className="flex-1 relative"
          onFocus={() => {
            const el = textareaRef.current;
            if (el) {
              el.style.borderColor = 'var(--color-primary)';
              el.style.boxShadow = '0 0 0 3px var(--color-primary-glow, rgba(99,102,241,0.1))';
            }
          }}
          onBlurCapture={() => {
            const el = textareaRef.current;
            if (el) {
              el.style.borderColor = 'var(--color-border)';
              el.style.boxShadow = 'none';
            }
          }}
        >
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? '未找到智能体配置...' : '发送消息...'}
            disabled={isStreaming || disabled}
            rows={1}
            className="w-full px-5 py-3.5 rounded-full border resize-none transition-all duration-200 text-sm disabled:opacity-50"
            style={{
              background: 'var(--color-bg)',
              borderColor: 'var(--color-border)',
              color: 'var(--color-text)',
              fontFamily: 'var(--font-body)',
              maxHeight: '150px',
            }}
          />
        </div>

        {/* 发送按钮 - 圆形 */}
        <button
          onClick={handleSend}
          disabled={!input.trim() || isStreaming || disabled}
          className="flex-shrink-0 w-11 h-11 rounded-full flex items-center justify-center transition-all duration-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          style={{
            background: input.trim() && !isStreaming ? 'var(--color-text)' : 'var(--color-bg-secondary)',
            color: input.trim() && !isStreaming ? 'var(--color-bg)' : 'var(--color-text-secondary)',
          }}
        >
          {isStreaming ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={18} />
          )}
        </button>
      </div>
    </div>
  );
}
