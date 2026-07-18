import { useEffect } from 'react';
import { useSettingsStore } from '@/stores/settingsStore';

/** 主题管理 hook — 同步 theme class 到 document */
export function useTheme() {
  const themeMode = useSettingsStore((s) => s.themeMode);

  useEffect(() => {
    const root = document.documentElement;

    if (themeMode === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else if (themeMode === 'light') {
      root.classList.add('light');
      root.classList.remove('dark');
    } else {
      // auto — 跟随系统，移除强制类
      root.classList.remove('dark', 'light');
    }
  }, [themeMode]);
}
