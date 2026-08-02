import Link from 'next/link';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { partnerSignup } from './actions';
import { LanguageToggle } from '../LanguageToggle';
import { ThemeToggle } from '../ThemeToggle';
import { defaultTheme, isSupportedTheme, THEME_COOKIE } from '@/theme/theme';

export default async function PartnerSignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; org?: string; email?: string }>;
}) {
  const [{ error, org, email }, t, cookieStore] = await Promise.all([
    searchParams,
    getTranslations('Partner.signup'),
    cookies(),
  ]);
  const cookieTheme = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isSupportedTheme(cookieTheme) ? cookieTheme : defaultTheme;

  const errorMessages: Record<string, string> = {
    missing_fields: t('errorMissingFields'),
    invalid_email: t('errorInvalidEmail'),
    weak_password: t('errorWeakPassword'),
    password_mismatch: t('errorPasswordMismatch'),
    already_registered: t('errorAlreadyRegistered'),
    signup_failed: t('errorSignupFailed'),
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface-tinted)] text-[#1A1A1A] dark:text-white px-4 py-10">
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle theme={theme} />
      </div>

      <div className="w-full max-w-sm bg-[var(--color-background)] rounded-[28px] border border-[var(--color-border)] p-8 shadow-sm">
        <h1 className="text-2xl font-bold text-[var(--color-forest)] mb-1">{t('title')}</h1>
        <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMessages[error] ?? t('errorSignupFailed')}
          </p>
        )}

        <form action={partnerSignup} className="space-y-4">
          <div>
            <label htmlFor="org" className="block text-sm font-medium mb-1">
              {t('orgLabel')}
            </label>
            <input
              id="org"
              name="org"
              type="text"
              required
              defaultValue={org}
              autoComplete="organization"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-tinted)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-forest)]"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              {t('emailLabel')}
            </label>
            <input
              id="email"
              name="email"
              type="email"
              required
              defaultValue={email}
              autoComplete="email"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-tinted)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-forest)]"
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
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-tinted)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-forest)]"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium mb-1">
              {t('confirmPasswordLabel')}
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              minLength={8}
              autoComplete="new-password"
              className="w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-tinted)] px-4 py-3 text-sm outline-none transition focus:border-[var(--color-forest)]"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-2xl bg-[var(--color-forest)] text-white py-3 text-sm font-semibold shadow-md hover:opacity-90 transition"
          >
            {t('submit')}
          </button>
        </form>

        <p className="mt-6 text-sm text-[var(--color-muted)] text-center">
          {t('haveAccount')}{' '}
          <Link href="/partner/login" className="text-[var(--color-forest)] font-medium hover:underline">
            {t('signIn')}
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
