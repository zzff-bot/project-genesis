import { create } from 'zustand';
import type { AgentConfig } from '@/shared/types';
import { generateId } from '@/shared/types';
import { buildSystemPrompt } from '@/engines/prompt/promptBuilder';
import { api } from '@/shared/services/api';
import { getToken } from '@/shared/services/api';

// ===== State =====
interface AgentState {
  agents: AgentConfig[];
  activeAgentId: string | null;
  isCreating: boolean;
  isLoading: boolean;
  isInitialized: boolean;
}

// ===== Actions =====
interface AgentActions {
  createAgent: (config: Omit<AgentConfig, 'id' | 'systemPrompt' | 'createdAt' | 'mode' | 'humanLike'> & { mode?: AgentConfig['mode']; humanLike?: boolean }) => Promise<AgentConfig>;
  updateAgent: (id: string, updates: Partial<Pick<AgentConfig, 'name' | 'personality' | 'character' | 'goal' | 'visualStyle' | 'humanLike' | 'mode'>>) => Promise<void>;
  setActiveAgent: (id: string | null) => void;
  removeAgent: (id: string) => Promise<void>;
  getAgent: (id: string) => AgentConfig | undefined;
  loadAgents: () => Promise<void>;
  setCreating: (creating: boolean) => void;
  reset: () => void;
}

function toAgentConfig(api: any): AgentConfig {
  const cfg = api.config || {};
  return {
    id: api.id,
    name: api.name,
    visualStyle: cfg.visualStyle || 'modern',
    mode: cfg.mode || 'character',
    humanLike: cfg.humanLike ?? false,
    personality: cfg.personality || '',
    character: cfg.character || '',
    goal: cfg.goal || '',
    systemPrompt: cfg.systemPrompt || '',
    createdAt: api.created_at,
  };
}

function toApiConfig(agent: Partial<AgentConfig> & { humanLike?: boolean }): Record<string, unknown> {
  return {
    visualStyle: agent.visualStyle,
    mode: agent.mode || 'character',
    humanLike: agent.humanLike ?? false,
    personality: agent.personality,
    character: agent.character,
    goal: agent.goal,
  };
}

export const useAgentStore = create<AgentState & AgentActions>((set, get) => ({
  agents: [],
  activeAgentId: null,
  isCreating: false,
  isLoading: false,
  isInitialized: false,

  createAgent: async (config) => {
    const humanLike = config.humanLike ?? false;
    const mode = (config as any).mode ?? 'character';
    const systemPrompt = buildSystemPrompt({ ...config, humanLike });
    const apiConfig = { ...toApiConfig({ ...config, humanLike }), systemPrompt };

    try {
      const result = await api.createAgent(config.name, apiConfig);
      const newAgent: AgentConfig = {
        ...config,
        id: result.id,
        mode,
        humanLike,
        systemPrompt,
        createdAt: result.created_at,
      };
      set((state) => ({ agents: [...state.agents, newAgent] }));
      return newAgent;
    } catch {
      // 离线回退：使用 localStorage（仅当前用户可见）
      const fallback: AgentConfig = {
        ...config,
        id: generateId(),
        mode: config.mode ?? 'character',
        humanLike,
        systemPrompt,
        createdAt: Date.now(),
      };
      set((state) => ({ agents: [...state.agents, fallback] }));
      return fallback;
    }
  },

  updateAgent: async (id, updates) => {
    const agent = get().agents.find((a) => a.id === id);
    if (!agent) return;

    const updated = { ...agent, ...updates };
    updated.systemPrompt = buildSystemPrompt(updated);

    set((state) => ({
      agents: state.agents.map((a) => (a.id === id ? updated : a)),
    }));

    try {
      await api.updateAgent(id, { name: updated.name, config: toApiConfig(updated) });
    } catch {}
  },

  setActiveAgent: (id) => {
    set({ activeAgentId: id });
  },

  removeAgent: async (id) => {
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      activeAgentId: state.activeAgentId === id ? null : state.activeAgentId,
    }));
    try { await api.deleteAgent(id); } catch {}
  },

  getAgent: (id) => get().agents.find((a) => a.id === id),

  loadAgents: async () => {
    const token = getToken();
    if (!token) {
      // 未登录：空状态，不从 localStorage 加载（避免跨账户数据泄露）
      set({ agents: [], isInitialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const result = await api.getAgents();
      const agents = result.agents.map(toAgentConfig);
      set({ agents, isInitialized: true, isLoading: false });
    } catch {
      // 加载失败保持空状态，不从 localStorage 回退（避免跨用户数据混入）
      set({ agents: [], isInitialized: true, isLoading: false });
    }
  },

  reset: () => {
    set({ agents: [], activeAgentId: null, isInitialized: false });
  },

  setCreating: (creating) => set({ isCreating: creating }),
}));
