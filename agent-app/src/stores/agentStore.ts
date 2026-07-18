import { create } from 'zustand';
import type { AgentConfig } from '@/shared/types';
import { generateId } from '@/shared/types';
import * as storage from '@/shared/services/storage';
import { buildSystemPrompt } from '@/engines/prompt/promptBuilder';

// ===== State =====
interface AgentState {
  agents: AgentConfig[];
  activeAgentId: string | null;
  isCreating: boolean;
}

// ===== Actions =====
interface AgentActions {
  createAgent: (config: Omit<AgentConfig, 'id' | 'systemPrompt' | 'createdAt' | 'mode' | 'humanLike'> & { mode?: AgentConfig['mode']; humanLike?: boolean }) => AgentConfig;
  updateAgent: (id: string, updates: Partial<Pick<AgentConfig, 'name' | 'personality' | 'character' | 'goal' | 'visualStyle' | 'humanLike' | 'mode'>>) => void;
  setActiveAgent: (id: string | null) => void;
  removeAgent: (id: string) => void;
  getAgent: (id: string) => AgentConfig | undefined;
  loadAgents: () => void;
  setCreating: (creating: boolean) => void;
  addAgent: (agent: AgentConfig) => void;
}

export const useAgentStore = create<AgentState & AgentActions>((set, get) => ({
  agents: storage.loadAgents(),
  activeAgentId: storage.getActiveAgentId(),
  isCreating: false,

  createAgent: (config) => {
    const humanLike = config.humanLike ?? false;
    const systemPrompt = buildSystemPrompt({ ...config, humanLike });
    const newAgent: AgentConfig = {
      ...config,
      id: generateId(),
      mode: config.mode ?? 'character',
      humanLike,
      systemPrompt,
      createdAt: Date.now(),
    };
    storage.addAgent(newAgent);
    set((state) => ({ agents: [...state.agents, newAgent] }));
    return newAgent;
  },

  updateAgent: (id, updates) => {
    set((state) => {
      const agents = state.agents.map((a) => {
        if (a.id !== id) return a;
        const updated = { ...a, ...updates };
        // 重新生成 system prompt
        updated.systemPrompt = buildSystemPrompt(updated);
        return updated;
      });
      storage.saveAgents(agents);
      return { agents };
    });
  },

  setActiveAgent: (id) => {
    storage.setActiveAgentId(id);
    set({ activeAgentId: id });
  },

  removeAgent: (id) => {
    storage.deleteAgent(id);
    set((state) => ({
      agents: state.agents.filter((a) => a.id !== id),
      activeAgentId: state.activeAgentId === id ? null : state.activeAgentId,
    }));
  },

  getAgent: (id) => get().agents.find((a) => a.id === id),

  loadAgents: () => {
    set({ agents: storage.loadAgents() });
  },

  setCreating: (creating) => {
    set({ isCreating: creating });
  },

  addAgent: (agent) => {
    set((state) => ({ agents: [...state.agents, agent] }));
  },
}));
