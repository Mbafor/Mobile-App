import Link from 'next/link';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { partnerLogin } from './actions';
import { LanguageToggle } from '../LanguageToggle';
import { ThemeToggle } from '../ThemeToggle';
import { defaultTheme, isSupportedTheme, THEME_COOKIE } from '@/theme/theme';

export default async function PartnerLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, t, cookieStore] = await Promise.all([
    searchParams,
    getTranslations('Partner.login'),
    cookies(),
  ]);
  const cookieTheme = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isSupportedTheme(cookieTheme) ? cookieTheme : defaultTheme;

  const errorMessages: Record<string, string> = {
    missing_fields: t('errorMissingFields'),
    invalid_credentials: t('errorInvalidCredentials'),
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] text-[#1A1A1A] dark:text-white px-4">
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle theme={theme} />
      </div>

      <div className="w-full max-w-sm bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">{t('title')}</h1>
        <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMessages[error] ?? t('errorGeneric')}
          </p>
        )}

        <form action={partnerLogin} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              {t('emailLabel')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoComplete="email"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-1">
              {t('passwordLabel')}
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              autoComplete="current-password"
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-[var(--color-forest)] text-white py-2 text-sm font-medium hover:opacity-90 transition"
          >
            {t('submit')}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)] text-center">
          {t('noAccount')}{' '}
          <Link href="/partner/signup" className="text-[var(--color-forest)] font-medium hover:underline">
            {t('createAccount')}
          </Link>
        </p>

        <p className="mt-4 text-xs text-[var(--color-muted)] text-center">
          {t.rich('termsAgreement', {
            terms: (chunks) => (
              <Link href="/terms" className="underline hover:text-[var(--color-forest)]">
                {chunks}
              </Link>
            ),
            privacy: (chunks) => (
              <Link href="/privacy" className="underline hover:text-[var(--color-forest)]">
                {chunks}
              </Link>
            ),
          })}
        </p>
      </div>
    </main>
  );
}
