import { useModeStore } from '@/stores/modeStore';

/**
 * 读取当前 AgentMode 的便捷 hook。
 * 组件可通过 `isCharacter` / `isProfessional` 做模式感知渲染。
 */
export function useAgentMode() {
  const currentMode = useModeStore((s) => s.currentMode);
  const setMode = useModeStore((s) => s.setMode);

  return {
    mode: currentMode,
    setMode,
    isCharacter: currentMode === 'character',
    isProfessional: currentMode === 'professional',
  } as const;
}
