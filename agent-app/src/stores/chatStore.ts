import { create } from 'zustand';
import type { ChatMessage } from '@/shared/types';
import { generateId } from '@/shared/types';
import { sendMessageStream } from '@/shared/services/deepseek';
import { api, getToken } from '@/shared/services/api';
import { useAgentStore } from './agentStore';

// ===== State =====
interface ChatState {
  sessions: Record<string, ChatMessage[]>;
  conversationIds: Record<string, string>; // agentId → conversationId (server)
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
  ensureConversation: (agentId: string, title?: string) => Promise<string>;
  loadMessagesFromServer: (agentId: string) => Promise<void>;
  reset: () => void;
}

export const useChatStore = create<ChatState & ChatActions>((set, get) => ({
  sessions: {},
  conversationIds: {},
  isStreaming: false,
  error: null,

  ensureConversation: async (agentId: string, title?: string) => {
    const existing = get().conversationIds[agentId];
    if (existing) return existing;

    const token = getToken();
    if (!token) return '';

    try {
      const conv = await api.createConversation(agentId, title);
      set((state) => ({
        conversationIds: { ...state.conversationIds, [agentId]: conv.id },
      }));
      return conv.id;
    } catch { return ''; }
  },

  loadMessagesFromServer: async (agentId: string) => {
    const token = getToken();
    if (!token) return;

    try {
      // 获取该 agent 的对话列表
      const result = await api.getConversations(agentId);
      if (result.conversations.length > 0) {
        const conv = result.conversations[0];
        // 保存 conversation mapping
        set((state) => ({
          conversationIds: { ...state.conversationIds, [agentId]: conv.id },
        }));
        // 加载消息
        try {
          const msgResult = await api.getMessages(conv.id);
          const messages: ChatMessage[] = msgResult.messages.map((m) => ({
            id: String(m.id),
            role: m.role,
            content: m.content,
            timestamp: m.timestamp,
          }));
          set((state) => ({
            sessions: { ...state.sessions, [agentId]: messages },
          }));
        } catch {}
      }
    } catch {}
  },

  sendMsg: async (content: string) => {
    const agentId = useAgentStore.getState().activeAgentId;
    if (!agentId) return;

    const agent = useAgentStore.getState().getAgent(agentId);
    if (!agent) {
      set({ error: '未找到智能体配置' });
      return;
    }

    set({ error: null });

    // 确保服务端对话存在
    const convId = await get().ensureConversation(agentId, content.slice(0, 30));

    // 添加用户消息到状态
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

    // 同步用户消息到服务端
    if (convId) {
      try { await api.addMessage(convId, 'user', content); } catch {}
    }

    // 添加空的助手消息
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

    set({ isStreaming: true });

    try {
      // 使用当前内存中的历史（不包括刚加的空助手消息）
      const history = get().sessions[agentId] || [];
      const historyWithoutLast = history.slice(0, -1);
      let fullContent = '';
      const stream = sendMessageStream(agent.systemPrompt, historyWithoutLast, content);

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
        if (rafId === null) { rafId = requestAnimationFrame(flushUpdate); }
      }

      if (rafId !== null) { cancelAnimationFrame(rafId); flushUpdate(); }

      // 同步助手消息到服务端
      if (convId) {
        try { await api.addMessage(convId, 'assistant', fullContent); } catch {}
      }
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : '发送消息失败';
      set({ error: errorMsg });
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
    set((state) => ({
      sessions: { ...state.sessions, [agentId]: [] },
      conversationIds: { ...state.conversationIds, [agentId]: undefined as any },
    }));
  },

  getMessages: (agentId: string) => get().sessions[agentId] || [],

  setSession: (agentId: string, messages: ChatMessage[]) => {
    set((state) => ({ sessions: { ...state.sessions, [agentId]: messages } }));
  },

  removeSession: (agentId: string) => {
    set((state) => {
      const newSessions = { ...state.sessions };
      delete newSessions[agentId];
      const newConvIds = { ...state.conversationIds };
      delete newConvIds[agentId];
      return { sessions: newSessions, conversationIds: newConvIds };
    });
  },

  reset: () => {
    set({ sessions: {}, conversationIds: {} });
  },
}));
