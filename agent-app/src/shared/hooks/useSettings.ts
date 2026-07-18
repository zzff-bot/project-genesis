import { useSettingsStore } from '@/stores/settingsStore';

/** 应用设置 hook — 封装 zustand store */
export function useSettings() {
  const themeMode = useSettingsStore((s) => s.themeMode);
  const fontSize = useSettingsStore((s) => s.fontSize);
  const setThemeMode = useSettingsStore((s) => s.setThemeMode);
  const setFontSize = useSettingsStore((s) => s.setFontSize);

  return { themeMode, fontSize, setThemeMode, setFontSize };
}
