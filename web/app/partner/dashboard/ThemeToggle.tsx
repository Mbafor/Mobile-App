'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';

import { THEME_COOKIE, type AppTheme } from '@/theme/theme';

export function ThemeToggle({ theme }: { theme: AppTheme }) {
  const router = useRouter();
  const t = useTranslations('Partner.header');
  const isDark = theme === 'dark';

  function toggle() {
    const next: AppTheme = isDark ? 'light' : 'dark';
    document.cookie = `${THEME_COOKIE}=${next}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={isDark ? t('themeToggleToLight') : t('themeToggleToDark')}
      title={isDark ? t('themeToggleToLight') : t('themeToggleToDark')}
      className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-[var(--color-border)] text-[var(--color-muted)] hover:bg-[var(--color-surface)] transition"
    >
      {isDark ? (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M6.34 17.66l-1.41 1.41M19.07 4.93l-1.41 1.41" />
        </svg>
      ) : (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
        </svg>
      )}
    </button>
  );
}
