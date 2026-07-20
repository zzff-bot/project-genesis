import { create } from 'zustand';
import type { User } from '@/shared/services/api';
import { api, getToken, setToken, clearToken } from '@/shared/services/api';

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
      // 清除旧的 localStorage 缓存，避免数据串号
      localStorage.removeItem('agent-configs');
      localStorage.removeItem('chat-sessions');
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
      localStorage.removeItem('agent-configs');
      localStorage.removeItem('chat-sessions');
      set({ user: result.user, isAuthenticated: true, isLoading: false, isInitialized: true });
    } catch (err) {
      set({ isLoading: false });
      throw err;
    }
  },

  logout: () => {
    clearToken();
    localStorage.removeItem('agent-configs');
    localStorage.removeItem('chat-sessions');
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
      set({ user: null, isAuthenticated: false, isLoading: false, isInitialized: true });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: true }),
}));
