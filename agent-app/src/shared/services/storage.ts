import type { AgentConfig, ChatMessage } from '@/shared/types';

const STORAGE_KEYS = {
  AGENTS: 'agent-configs',
  SESSIONS: 'chat-sessions',
  ACTIVE_AGENT: 'active-agent-id',
} as const;

// ===== 内存缓存层 =====
// 避免每次读取都触发 JSON.parse，在写入时自动失效

let agentsCache: AgentConfig[] | null = null;
let sessionsCache: Record<string, ChatMessage[]> | null = null;

function clearAgentsCache(): void { agentsCache = null; }
function clearSessionsCache(): void { sessionsCache = null; }

// ===== 智能体配置存储 =====

export function loadAgents(): AgentConfig[] {
  if (agentsCache) return agentsCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.AGENTS);
    const result: AgentConfig[] = raw ? JSON.parse(raw) : [];
    agentsCache = result;
    return result;
  } catch {
    return [];
  }
}

export function saveAgents(agents: AgentConfig[]): void {
  agentsCache = agents;
  localStorage.setItem(STORAGE_KEYS.AGENTS, JSON.stringify(agents));
}

export function findAgent(id: string): AgentConfig | undefined {
  return loadAgents().find((a) => a.id === id);
}

export function addAgent(agent: AgentConfig): void {
  clearAgentsCache();
  const agents = loadAgents();
  agents.push(agent);
  saveAgents(agents);
}

export function deleteAgent(id: string): void {
  clearAgentsCache();
  const agents = loadAgents().filter((a) => a.id !== id);
  saveAgents(agents);
  // 同时删除关联的对话
  clearSessionsCache();
  removeSession(id);
  // 如果删除的是活跃智能体，清除活跃状态
  if (getActiveAgentId() === id) {
    setActiveAgentId(null);
  }
}

// ===== 活跃智能体 =====

export function getActiveAgentId(): string | null {
  return localStorage.getItem(STORAGE_KEYS.ACTIVE_AGENT);
}

export function setActiveAgentId(id: string | null): void {
  if (id) {
    localStorage.setItem(STORAGE_KEYS.ACTIVE_AGENT, id);
  } else {
    localStorage.removeItem(STORAGE_KEYS.ACTIVE_AGENT);
  }
}

// ===== 对话历史存储 =====

export function loadAllSessions(): Record<string, ChatMessage[]> {
  if (sessionsCache) return sessionsCache;
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SESSIONS);
    const parsed: Record<string, ChatMessage[]> = raw ? JSON.parse(raw) : {};
    sessionsCache = parsed;
    return parsed;
  } catch {
    return {};
  }
}

export function loadSession(agentId: string): ChatMessage[] {
  const sessions = loadAllSessions();
  return sessions[agentId] || [];
}

export function saveSession(agentId: string, messages: ChatMessage[]): void {
  const sessions = loadAllSessions();
  sessions[agentId] = messages;
  sessionsCache = sessions;
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function addMessage(agentId: string, message: ChatMessage): void {
  const messages = loadSession(agentId);
  messages.push(message);
  saveSession(agentId, messages);
}

export function removeSession(agentId: string): void {
  const sessions = loadAllSessions();
  delete sessions[agentId];
  sessionsCache = sessions;
  localStorage.setItem(STORAGE_KEYS.SESSIONS, JSON.stringify(sessions));
}

export function clearSession(agentId: string): void {
  saveSession(agentId, []);
}
