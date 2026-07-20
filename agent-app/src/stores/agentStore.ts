import { create } from 'zustand';
import type { AgentConfig } from '@/shared/types';
import { generateId } from '@/shared/types';
import { buildSystemPrompt } from '@/engines/prompt/promptBuilder';
import { api } from '@/shared/services/api';
import { getToken } from '@/shared/services/api';
import * as storage from '@/shared/services/storage';

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
  activeAgentId: storage.getActiveAgentId(),
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
      // 同步更新 localStorage（保留本地缓存）
      try { storage.addAgent(newAgent); } catch {}
      return newAgent;
    } catch {
      // 离线回退：使用 localStorage
      const fallback: AgentConfig = {
        ...config,
        id: generateId(),
        mode: config.mode ?? 'character',
        humanLike,
        systemPrompt,
        createdAt: Date.now(),
      };
      storage.addAgent(fallback);
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
    // 同步 localStorage
    try { storage.saveAgents(get().agents); } catch {}
  },

  setActiveAgent: (id) => {
    storage.setActiveAgentId(id);
    set({ activeAgentId: id });
  },

  removeAgent: async (id) => {
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      activeAgentId: state.activeAgentId === id ? null : state.activeAgentId,
    }));
    try { await api.deleteAgent(id); } catch {}
    try { storage.deleteAgent(id); } catch {}
  },

  getAgent: (id) => get().agents.find((a) => a.id === id),

  loadAgents: async () => {
    const token = getToken();
    if (!token) {
      // 未登录：从 localStorage 加载
      const localAgents = storage.loadAgents();
      set({ agents: localAgents, isInitialized: true });
      return;
    }

    set({ isLoading: true });
    try {
      const result = await api.getAgents();
      const agents = result.agents.map(toAgentConfig);
      set({ agents, isInitialized: true, isLoading: false });
      // 同步到 localStorage 作为缓存
      try { storage.saveAgents(agents); } catch {}
    } catch {
      // 回退到 localStorage
      const localAgents = storage.loadAgents();
      set({ agents: localAgents, isInitialized: true, isLoading: false });
    }
  },

  setCreating: (creating) => set({ isCreating: creating }),
}));
