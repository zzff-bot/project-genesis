import { create } from 'zustand';
import type { User } from '@/shared/services/api';
import { api, getToken, setToken, clearToken } from '@/shared/services/api';
import { useAgentStore } from './agentStore';
import { useChatStore } from './chatStore';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, username: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
  setUser: (user: User) => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  isInitialized: false,

  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const result = await api.login(email, password);
      setToken(result.token);
      // 重置其他 store 的内存状态，防止上一个用户数据残留
      useAgentStore.getState().reset();
      useChatStore.getState().reset();
      set({ user: result.user, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  register: async (email, username, password) => {
    set({ isLoading: true });
    try {
      const result = await api.register(email, username, password);
      setToken(result.token);
      // 重置其他 store 的内存状态，新用户从零开始
      useAgentStore.getState().reset();
      useChatStore.getState().reset();
      set({ user: result.user, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    clearToken();
    // 重置所有 store 状态
    useAgentStore.getState().reset();
    useChatStore.getState().reset();
    set({ user: null, isAuthenticated: false, isInitialized: true });
  },

  checkAuth: async () => {
    const token = getToken();
    if (!token) {
      set({ isInitialized: true, isAuthenticated: false, user: null });
      return;
    }
    set({ isLoading: true });
    try {
      const result = await api.me();
      set({ user: result.user, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch {
      clearToken();
      useAgentStore.getState().reset();
      useChatStore.getState().reset();
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
}));
