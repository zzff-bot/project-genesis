import { create } from 'zustand';
import type { AgentMode } from '@/shared/types';

interface ModeState {
  /** 当前会话的 AgentMode（暂存态，不持久化） */
  currentMode: AgentMode;
  setMode: (mode: AgentMode) => void;
}

/** Agent 模式 store — 内存态，每个 agent 切换时重置为其默认模式 */
export const useModeStore = create<ModeState>((set) => ({
  currentMode: 'character',
  setMode: (mode) => set({ currentMode: mode }),
}));
