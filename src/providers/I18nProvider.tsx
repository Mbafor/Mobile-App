import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react';

import { STORAGE_KEYS } from '@/constants/storage-keys';
import i18n from '@/i18n';
import { detectOsLanguage } from '@/i18n/detect-language';
import type { LanguageMode, ResolvedLanguage } from '@/i18n/types';
import { getItem, setItem } from '@/utils/storage/async-storage';

type I18nContextValue = {
  /** The language currently rendered (device default or user override). */
  language: ResolvedLanguage;
  /** The stored preference: 'system' or a pinned language. */
  mode: LanguageMode;
  setLanguage: (mode: LanguageMode) => void;
};

const I18nContext = createContext<I18nContextValue | null>(null);

function isLanguageMode(value: string | null): value is LanguageMode {
  return value === 'system' || value === 'en' || value === 'fr';
}

function resolveLanguage(mode: LanguageMode): ResolvedLanguage {
  return mode === 'system' ? detectOsLanguage() : mode;
}

/**
 * Owns the language preference the same way ThemeProvider owns the theme mode:
 * default 'system', hydrate a persisted override from AsyncStorage on mount,
 * and keep the shared i18next instance in sync with the resolved language.
 */
export function I18nProvider({ children }: PropsWithChildren) {
  const [mode, setModeState] = useState<LanguageMode>('system');

  useEffect(() => {
    let cancelled = false;
    getItem(STORAGE_KEYS.LANGUAGE_PREFERENCE).then((stored) => {
      if (!cancelled && isLanguageMode(stored)) {
        setModeState(stored);
      }
    });
    return () => {
      cancelled = true;
    };
  }, []);

  const setLanguage = useCallback((next: LanguageMode) => {
    setModeState(next);
    void setItem(STORAGE_KEYS.LANGUAGE_PREFERENCE, next);
  }, []);

  const language = resolveLanguage(mode);

  useEffect(() => {
    if (i18n.language !== language) {
      void i18n.changeLanguage(language);
    }
  }, [language]);

  const value = useMemo<I18nContextValue>(
    () => ({ language, mode, setLanguage }),
    [language, mode, setLanguage],
  );

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

export function useI18nContext(): I18nContextValue {
  const ctx = useContext(I18nContext);
  if (!ctx) {
    throw new Error('useI18nContext must be used within I18nProvider');
  }
  return ctx;
}
