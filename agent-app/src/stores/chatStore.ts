import { create } from 'zustand';
import type { ChatMessage } from '@/shared/types';
import { generateId } from '@/shared/types';
import * as storage from '@/shared/services/storage';
import { sendMessageStream } from '@/shared/services/deepseek';
import { useAgentStore } from './agentStore';

// ===== State =====
interface ChatState {
  sessions: Record<string, ChatMessage[]>;
  isStreaming: boolean;
  error: string | null;
}

// ===== Actions =====
interface ChatActions {
  sendMsg: (content: string) => Promise<void>;
  clearChat: (agentId: string) => void;
  getMessages: (agentId: string) => ChatMessage[];
  setSession: (agentId: string, messages: ChatMessage[]) => void;
  removeSession: (agentId: string) => void;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  sessions: storage.loadAllSessions(),
  isStreaming: false,
  error: null,

  sendMsg: async (content: string) => {
    const agentId = useAgentStore.getState().activeAgentId;
    if (!agentId) return;

    const agent = useAgentStore.getState().getAgent(agentId);
    if (!agent) {
      set({ error: '未找到智能体配置' });
      return;
    }

    set({ error: null });

    // 添加用户消息
    const userMsg: ChatMessage = {
      id: generateId(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };
    set((state) => {
      const existing = state.sessions[agentId] || [];
      return { sessions: { ...state.sessions, [agentId]: [...existing, userMsg] } };
    });
    storage.addMessage(agentId, userMsg);

    // 添加空的助手消息（用于流式填充）
    const assistantMsg: ChatMessage = {
      id: generateId(),
      role: 'assistant',
      content: '',
      timestamp: Date.now(),
    };
    set((state) => {
      const existing = state.sessions[agentId] || [];
      return { sessions: { ...state.sessions, [agentId]: [...existing, assistantMsg] } };
    });

    // 流式获取回复
    set({ isStreaming: true });

    try {
      const history = storage.loadSession(agentId);
      // 移除刚加的空消息（sendMessageStream 内部会构建正确的历史）
      const historyWithoutLast = history.slice(0, -1);

      let fullContent = '';
      const stream = sendMessageStream(agent.systemPrompt, historyWithoutLast, content);

      // 使用 RAF 节流，避免每个 chunk 都触发 re-render
      let rafId: number | null = null;
      let pendingContent = '';

      const flushUpdate = () => {
        set((state) => {
          const messages = state.sessions[agentId] || [];
          if (messages.length === 0) return state;
          const updated = [...messages];
          const lastIdx = updated.length - 1;
          updated[lastIdx] = { ...updated[lastIdx], content: pendingContent };
          return { sessions: { ...state.sessions, [agentId]: updated } };
        });
        rafId = null;
      };

      for await (const chunk of stream) {
        fullContent += chunk;
        pendingContent = fullContent;

        if (rafId === null) {
          rafId = requestAnimationFrame(flushUpdate);
        }
      }

      // 确保最后一次更新被刷新
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        flushUpdate();
      }

      // 流结束后追加助手消息到存储
      const currentMessages = storage.loadSession(agentId);
      currentMessages.push({
        id: generateId(),
        role: 'assistant' as const,
        content: fullContent,
        timestamp: Date.now(),
      });
      storage.saveSession(agentId, currentMessages);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '发送消息失败';
      set({ error: errorMsg });

      // 更新助手消息为错误提示
      set((state) => {
        const messages = state.sessions[agentId] || [];
        if (messages.length === 0) return state;
        const updated = [...messages];
        const lastIdx = updated.length - 1;
        updated[lastIdx] = { ...updated[lastIdx], content: `❌ 出错了：${errorMsg}` };
        return { sessions: { ...state.sessions, [agentId]: updated } };
      });
    } finally {
      set({ isStreaming: false });
    }
  },

  clearChat: (agentId: string) => {
    storage.clearSession(agentId);
    set((state) => ({
      sessions: { ...state.sessions, [agentId]: [] },
    }));
  },

  getMessages: (agentId: string) => {
    return get().sessions[agentId] || [];
  },

  setSession: (agentId: string, messages: ChatMessage[]) => {
    set((state) => ({
      sessions: { ...state.sessions, [agentId]: messages },
    }));
  },

  removeSession: (agentId: string) => {
    set((state) => {
      const newSessions = { ...state.sessions };
      delete newSessions[agentId];
      return { sessions: newSessions };
    });
  },
}));
