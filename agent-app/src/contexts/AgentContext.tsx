// 向后兼容 wrapper — 内部使用 zustand stores
// 请直接使用 @/stores/agentStore 和 @/stores/chatStore
import { createContext, useContext, type ReactNode } from 'react';
import { useAgent as useAgentInternal } from '@/shared/hooks/useAgent';
import type { AgentConfig, ChatMessage } from '@/shared/types';

// ===== 兼容类型（与旧版 useAgent() 返回值相同） =====
interface AgentContextType {
  state: {
    agents: AgentConfig[];
    activeAgentId: string | null;
    sessions: Record<string, ChatMessage[]>;
    isCreating: boolean;
    isStreaming: boolean;
    error: string | null;
  };
  createAgent: (config: Omit<AgentConfig, 'id' | 'systemPrompt' | 'createdAt' | 'mode' | 'humanLike'> & { mode?: AgentConfig['mode']; humanLike?: boolean }) => AgentConfig;
  selectAgent: (id: string) => void;
  removeAgent: (id: string) => void;
  updateAgent: (id: string, updates: Partial<Pick<AgentConfig, 'name' | 'personality' | 'character' | 'goal' | 'visualStyle' | 'humanLike' | 'mode'>>) => void;
  sendMsg: (content: string) => Promise<void>;
  clearChat: (agentId: string) => void;
  getAgent: (id: string) => AgentConfig | undefined;
  getMessages: (agentId: string) => ChatMessage[];
}

const AgentContext = createContext<AgentContextType | null>(null);

export function AgentProvider({ children }: { children: ReactNode }) {
  const agent = useAgentInternal();
  return <AgentContext.Provider value={agent as unknown as AgentContextType}>{children}</AgentContext.Provider>;
}

export function useAgent(): AgentContextType {
  const ctx = useContext(AgentContext);
  if (!ctx) {
    throw new Error('useAgent 必须在 AgentProvider 内部使用');
  }
  return ctx;
}
