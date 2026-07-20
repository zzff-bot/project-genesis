/**
 * 统一 API 客户端 v2
 *
 * 封装对 Cloudflare Worker 的 HTTP 请求，涵盖认证、智能体、对话、消息、使用日志、管理后台。
 */

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8787';
const TOKEN_KEY = 'auth-token';

// ===== Token 管理 =====
export function getToken(): string | null { return localStorage.getItem(TOKEN_KEY); }
export function setToken(token: string): void { localStorage.setItem(TOKEN_KEY, token); }
export function clearToken(): void { localStorage.removeItem(TOKEN_KEY); }

// ===== 请求封装 =====
class ApiClientError extends Error {
  status: number;
  constructor(message: string, status: number) { super(message); this.name = 'ApiClientError'; this.status = status; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${API_BASE}${path}`, { ...options, headers });

  if (response.status === 401) {
    clearToken();
    window.dispatchEvent(new CustomEvent('auth:unauthorized'));
  }

  const data = await response.json();
  if (!response.ok) throw new ApiClientError(data.error || `请求失败 (${response.status})`, response.status);
  return data as T;
}

// ===== 类型 =====
export interface User {
  id: string; email: string; username: string; role: 'user' | 'admin'; status: string;
  created_at: number; last_login?: number;
}
export interface AuthResponse { token: string; user: User; }
export interface AgentData {
  id: string; name: string; config: Record<string, unknown>; config_json?: string;
  created_at: number; updated_at: number;
  user_id?: string; username?: string; email?: string;
}
export interface ConversationData {
  id: string; user_id: string; agent_id: string; title: string | null;
  created_at: number; updated_at: number; messageCount: number;
  username?: string; email?: string; duration?: number;
}
export interface MessageData {
  id: number; conversation_id: string; role: 'user' | 'assistant';
  content: string; timestamp: number;
}
export interface AdminStats {
  totalUsers: number; todayUsers: number; adminCount: number;
  totalAgents: number; totalConversations: number; totalMessages: number;
}
export interface AdminUserDetail {
  user: User;
  password: string | null;
  agents: AgentData[];
  conversations: ConversationData[];
  stats: { totalMessages: number; totalAgents: number; totalConversations: number; activeDays: number; lastActivity: Array<{ event_type: string; timestamp: number }> };
}

// ===== API 方法 =====
export const api = {
  // 认证
  register: (email: string, username: string, password: string) =>
    request<AuthResponse>('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, username, password }) }),
  login: (email: string, password: string) =>
    request<AuthResponse>('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),
  me: () => request<{ user: User }>('/api/auth/me'),

  // 智能体
  getAgents: () => request<{ agents: AgentData[] }>('/api/agents'),
  createAgent: (name: string, config: Record<string, unknown>) =>
    request<AgentData>('/api/agents', { method: 'POST', body: JSON.stringify({ name, config }) }),
  updateAgent: (id: string, data: { name?: string; config?: Record<string, unknown> }) =>
    request<{ success: boolean }>(`/api/agents/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteAgent: (id: string) =>
    request<{ success: boolean }>(`/api/agents/${id}`, { method: 'DELETE' }),

  // 对话
  getConversations: (agentId?: string) => {
    const q = agentId ? `?agent_id=${encodeURIComponent(agentId)}` : '';
    return request<{ conversations: ConversationData[] }>(`/api/conversations${q}`);
  },
  createConversation: (agent_id: string, title?: string) =>
    request<ConversationData>('/api/conversations', { method: 'POST', body: JSON.stringify({ agent_id, title }) }),
  addMessage: (conversationId: string, role: 'user' | 'assistant', content: string) =>
    request<{ success: boolean; timestamp: number }>(`/api/conversations/${conversationId}/messages`, {
      method: 'POST', body: JSON.stringify({ role, content }),
    }),
  getMessages: (conversationId: string) =>
    request<{ messages: MessageData[] }>(`/api/conversations/${conversationId}/messages`),

  // 使用日志
  logUsage: (event_type: string, metadata?: Record<string, unknown>) =>
    request<{ success: boolean }>('/api/usage/log', { method: 'POST', body: JSON.stringify({ event_type, metadata }) }),

  // 管理员
  adminUsers: (limit = 100, offset = 0) =>
    request<{ users: User[]; total: number; limit: number; offset: number }>(`/api/admin/users?limit=${limit}&offset=${offset}`),
  adminStats: () => request<AdminStats>('/api/admin/stats'),
  adminUserDetail: (userId: string) => request<AdminUserDetail>(`/api/admin/users/${userId}`),
  adminDeleteUser: (userId: string) => request<{ success: boolean }>(`/api/admin/users/${userId}`, { method: 'DELETE' }),
  adminUpdateStatus: (userId: string, status: 'active' | 'frozen') =>
    request<{ success: boolean }>(`/api/admin/users/${userId}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
  adminConversationMessages: (conversationId: string) =>
    request<{ conversation: { id: string; title: string | null; agent_id: string; user_id: string }; messages: MessageData[] }>(`/api/admin/conversations/${conversationId}/messages`),
  adminAllAgents: (limit = 100, offset = 0) =>
    request<{ agents: AgentData[]; total: number; limit: number; offset: number }>(`/api/admin/agents?limit=${limit}&offset=${offset}`),
  adminAllConversations: (limit = 100, offset = 0) =>
    request<{ conversations: ConversationData[]; total: number; limit: number; offset: number }>(`/api/admin/conversations?limit=${limit}&offset=${offset}`),
};
