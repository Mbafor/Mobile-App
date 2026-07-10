import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';
import { useColorScheme } from 'react-native';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import { buildAppTheme } from '@/constants/theme/palettes';
import type { AppTheme, ResolvedTheme, ThemeMode } from '@/constants/theme/types';
import { getItem, setItem } from '@/utils/storage/async-storage';

type ThemeContextValue = AppTheme & {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function isThemeMode(value: string | null): value is ThemeMode {
  return value === 'system' || value === 'light' || value === 'dark';
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');

  useEffect(() => {
    let cancelled = false;
    getItem(STORAGE_KEYS.THEME_PREFERENCE).then((stored) => {
      if (!cancelled && isThemeMode(stored)) {
        setModeState(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void setItem(STORAGE_KEYS.THEME_PREFERENCE, next);
  }, []);

  const resolved: ResolvedTheme = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...buildAppTheme(resolved),
      mode,
      setMode,
    }),
    [resolved, mode, setMode],
  );

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useThemeContext(): ThemeContextValue {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useThemeContext must be used within ThemeProvider');
  }
  return ctx;
}
