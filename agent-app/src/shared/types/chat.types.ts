import type { AgentConfig } from './agent.types';

// ===== 对话消息 =====
export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

// ===== 对话会话 =====
export interface ChatSession {
  agentId: string;
  messages: ChatMessage[];
  updatedAt: number;
}

// ===== App 全局状态 =====
export interface AppState {
  agents: AgentConfig[];
  activeAgentId: string | null;
  sessions: Record<string, ChatMessage[]>;
  isCreating: boolean;
}
