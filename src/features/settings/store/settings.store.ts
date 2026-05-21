import { create } from 'zustand';

type ThemeMode = 'light' | 'dark' | 'system';

type SettingsState = {
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
};

export const useSettingsStore = create<SettingsState>((set) => ({
  themeMode: 'system',
  setThemeMode: (themeMode) => set({ themeMode }),
}));
