import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  type PropsWithChildren,
} from 'react';

import { buildAppTheme } from '@/constants/theme/palettes';
import type { AppTheme, ThemeMode } from '@/constants/theme/types';

type ThemeContextValue = AppTheme & {
  mode: ThemeMode;
  setMode: (mode: ThemeMode) => void;
};

const ThemeContext = createContext<ThemeContextValue | null>(null);

/** App uses a single light theme; mode APIs are kept for compatibility. */
export function ThemeProvider({ children }: PropsWithChildren) {
  const setMode = useCallback((_next: ThemeMode) => {
    // no-op — light theme only
  }, []);

  const value = useMemo<ThemeContextValue>(
    () => ({
      ...buildAppTheme('light'),
      mode: 'light',
      setMode,
    }),
    [setMode],
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
