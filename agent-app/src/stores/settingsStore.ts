import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type ThemeMode = 'light' | 'dark' | 'auto';

interface SettingsState {
  themeMode: ThemeMode;
  fontSize: 'small' | 'medium' | 'large';
  sidebarCollapsed: boolean;

  setThemeMode: (mode: ThemeMode) => void;
  setFontSize: (size: 'small' | 'medium' | 'large') => void;
  setSidebarCollapsed: (collapsed: boolean) => void;
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      themeMode: 'auto',
      fontSize: 'medium',
      sidebarCollapsed: false,

      setThemeMode: (mode) => set({ themeMode: mode }),
      setFontSize: (size) => set({ fontSize: size }),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
    }),
    {
      name: 'app-settings',
    },
  ),
);
