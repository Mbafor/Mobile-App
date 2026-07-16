import { redirect } from 'next/navigation';
import { cookies } from 'next/headers';
import { getTranslations } from 'next-intl/server';

import { PartnerOtpForm } from './PartnerOtpForm';
import { LanguageToggle } from '../LanguageToggle';
import { ThemeToggle } from '../ThemeToggle';
import { defaultTheme, isSupportedTheme, THEME_COOKIE } from '@/theme/theme';

export default async function PartnerVerifyOtpPage({
  searchParams,
}: {
  searchParams: Promise<{ email?: string; org?: string; error?: string; resent?: string }>;
}) {
  const [{ email, org, error, resent }, t, cookieStore] = await Promise.all([
    searchParams,
    getTranslations('Partner.verifyOtp'),
    cookies(),
  ]);
  const cookieTheme = cookieStore.get(THEME_COOKIE)?.value;
  const theme = isSupportedTheme(cookieTheme) ? cookieTheme : defaultTheme;

  if (!email || !org) redirect('/partner/signup');

  const errorMessages: Record<string, string> = {
    invalid_code: t('errorInvalidCode'),
    account_disabled: t('errorAccountDisabled'),
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] text-[#1A1A1A] dark:text-white px-4 py-10">
      <div className="fixed top-4 right-4 flex items-center gap-2">
        <LanguageToggle />
        <ThemeToggle theme={theme} />
      </div>

      <div className="w-full max-w-sm bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">{t('title')}</h1>
        <p className="text-sm text-[var(--color-muted)] mb-6">
          {t.rich('subtitle', { email, bold: (chunks) => <span className="font-medium">{chunks}</span> })}
        </p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMessages[error] ?? t('errorGeneric')}
          </p>
        )}
        {resent && !error && (
          <p className="mb-4 text-sm text-[var(--color-forest)] bg-[var(--color-forest)]/10 border border-[var(--color-forest)]/30 rounded-md px-3 py-2">
            {t('resentNotice')}
          </p>
        )}

        <PartnerOtpForm email={email} org={org} />
      </div>
    </main>
  );
}
