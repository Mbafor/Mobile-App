import { getTranslations } from 'next-intl/server';

import { adminLogin } from './actions';

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const [{ error }, t] = await Promise.all([searchParams, getTranslations('Admin.login')]);

  const errorMessages: Record<string, string> = {
    missing_fields: t('errorMissingFields'),
    invalid_credentials: t('errorInvalidCredentials'),
    not_admin: t('errorNotAdmin'),
  };

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-sm bg-[var(--color-background)] rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
        <h1 className="text-2xl font-semibold text-primary mb-1">{t('title')}</h1>
        <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

        {error && (
          <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
            {errorMessages[error] ?? t('errorGeneric')}
          </p>
        )}

        <form action={adminLogin} className="space-y-4">
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
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
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
              className="w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
          <button
            type="submit"
            className="w-full rounded-md bg-primary text-white py-2 text-sm font-medium hover:opacity-90 transition"
          >
            {t('submit')}
          </button>
        </form>
      </div>
    </main>
  );
}
