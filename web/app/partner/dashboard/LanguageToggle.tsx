'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useTransition } from 'react';

import { useSetLocale } from '@/i18n/IntlClientProvider';
import type { AppLocale } from '@/i18n/locales';

const LOCALES: AppLocale[] = ['en', 'fr'];

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const setLocale = useSetLocale();
  const t = useTranslations('Partner.header');
  const [, startTransition] = useTransition();

  function selectLocale(code: AppLocale) {
    if (code === locale) return;
    setLocale(code);
    // Reconciles server-rendered strings (page headings, etc.) with the new
    // locale in the background -- non-blocking, so the UI above already
    // reflects the new language instantly.
    startTransition(() => {
      router.refresh();
    });
  }

  return (
    <div
      role="group"
      aria-label={t('languageToggleLabel')}
      className="inline-flex h-9 items-center rounded-lg border border-[var(--color-border)] p-0.5 text-sm font-semibold"
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          onClick={() => selectLocale(code)}
          aria-pressed={locale === code}
          className={`rounded-md px-2.5 py-1 transition ${
            locale === code
              ? 'bg-[var(--color-forest)] text-white'
              : 'text-[var(--color-muted)] hover:bg-[var(--color-surface)]'
          }`}
        >
          {code.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
