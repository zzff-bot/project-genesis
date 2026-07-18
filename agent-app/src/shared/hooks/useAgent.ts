import { useAgentStore } from '@/stores/agentStore';
import { useChatStore } from '@/stores/chatStore';
import * as storage from '@/shared/services/storage';
import type { AgentConfig, ChatMessage } from '@/shared/types';

// ===== 兼容包装：组合 agentStore + chatStore = 与原 useAgent() 完全相同的 shape =====
export function useAgent() {
  const agents = useAgentStore((s) => s.agents);
  const activeAgentId = useAgentStore((s) => s.activeAgentId);
  const isCreating = useAgentStore((s) => s.isCreating);
  const createAgent = useAgentStore((s) => s.createAgent);
  const removeAgent = useAgentStore((s) => s.removeAgent);
  const updateAgent = useAgentStore((s) => s.updateAgent);
  const getAgent = useAgentStore((s) => s.getAgent);

  const sessions = useChatStore((s) => s.sessions);
  const isStreaming = useChatStore((s) => s.isStreaming);
  const error = useChatStore((s) => s.error);
  const sendMsg = useChatStore((s) => s.sendMsg);
  const clearChat = useChatStore((s) => s.clearChat);
  const getMessages = useChatStore((s) => s.getMessages);

  const selectAgent = (id: string) => {
    storage.setActiveAgentId(id);
    useAgentStore.getState().setActiveAgent(id);
    const messages = storage.loadSession(id);
    useChatStore.getState().setSession(id, messages);
  };

  // 包装 removeAgent：同步清理 chatStore 中的对话记录
  const removeAgentAndCleanup = (id: string) => {
    removeAgent(id);
    useChatStore.getState().removeSession(id);
  };

  return {
    state: { agents, activeAgentId, sessions, isCreating, isStreaming, error },
    createAgent,
    selectAgent,
    removeAgent: removeAgentAndCleanup,
    updateAgent,
    sendMsg,
    clearChat,
    getAgent,
    getMessages,
  } as const;
}

// 类型导出保持兼容
export type { AgentConfig, ChatMessage };
