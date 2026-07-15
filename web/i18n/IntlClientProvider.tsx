'use client';

import { NextIntlClientProvider } from 'next-intl';
import { createContext, useCallback, useContext, useState, type ComponentProps, type ReactNode } from 'react';

import { LOCALE_COOKIE, type AppLocale } from './locales';

type Messages = ComponentProps<typeof NextIntlClientProvider>['messages'];

const messageLoaders: Record<AppLocale, () => Promise<{ default: Messages }>> = {
  en: () => import('../messages/en.json'),
  fr: () => import('../messages/fr.json'),
};

const SetLocaleContext = createContext<((locale: AppLocale) => void) | null>(null);

/** Switches locale entirely client-side (cookie + swapped message bundle) -- no server round trip. */
export function useSetLocale() {
  const setLocale = useContext(SetLocaleContext);
  if (!setLocale) throw new Error('useSetLocale must be used within IntlClientProvider');
  return setLocale;
}

export function IntlClientProvider({
  initialLocale,
  initialMessages,
  children,
}: {
  initialLocale: AppLocale;
  initialMessages: Messages;
  children: ReactNode;
}) {
  const [locale, setLocale] = useState(initialLocale);
  const [messages, setMessages] = useState(initialMessages);

  const switchLocale = useCallback(
    (next: AppLocale) => {
      if (next === locale) return;
      document.cookie = `${LOCALE_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
      document.documentElement.lang = next;
      setLocale(next);
      void messageLoaders[next]().then((mod) => setMessages(mod.default));
    },
    [locale],
  );

  return (
    <SetLocaleContext.Provider value={switchLocale}>
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </SetLocaleContext.Provider>
  );
}
