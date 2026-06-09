import { useColorScheme } from 'react-native';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { buildAppTheme } from '@/constants/theme/palettes';
import type { AppTheme, ResolvedTheme, ThemeMode } from '@/constants/theme/types';
import { STORAGE_KEYS } from '@/constants/storage-keys';
import { getItem, setItem } from '@/utils/storage/async-storage';

type ThemeContextValue = AppTheme & {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

function resolveMode(mode: ThemeMode, systemScheme: ResolvedTheme | null | undefined): ResolvedTheme {
  if (mode === 'system') {
    return systemScheme === 'dark' ? 'dark' : 'light';
  }
  return mode;
}

export function ThemeProvider({ children }: PropsWithChildren) {
  const systemScheme = useColorScheme();
  const [mode, setModeState] = useState<ThemeMode>('system');
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    void (async () => {
      const stored = await getItem(STORAGE_KEYS.THEME_PREFERENCE);
      if (stored === 'light' || stored === 'dark' || stored === 'system') {
        setModeState(stored);
      }
      setHydrated(true);
    })();
  }, []);

  const setMode = useCallback((next: ThemeMode) => {
    setModeState(next);
    void setItem(STORAGE_KEYS.THEME_PREFERENCE, next);
  }, []);

  const resolved = resolveMode(mode, systemScheme);
  const value = useMemo<ThemeContextValue>(
    () => ({
      ...buildAppTheme(resolved),
      mode,
      setMode,
    }),
    [mode, resolved],
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
