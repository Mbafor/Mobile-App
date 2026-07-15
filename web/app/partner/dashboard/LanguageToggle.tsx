'use client';

import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

import { LOCALE_COOKIE, type AppLocale } from '@/i18n/locales';

const LOCALES: AppLocale[] = ['en', 'fr'];

export function LanguageToggle() {
  const locale = useLocale();
  const router = useRouter();
  const t = useTranslations('Partner.header');

  function selectLocale(code: AppLocale) {
    document.cookie = `${LOCALE_COOKIE}=${code}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
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
