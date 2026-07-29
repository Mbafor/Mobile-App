'use client';

import { useTranslations } from 'next-intl';

import { adminLogout } from './login/actions';

export function AdminHeader({ name }: { name: string }) {
  const t = useTranslations('Admin.header');

  return (
    <header className="border-b border-[var(--color-border)] bg-[var(--color-background)]">
      <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-primary">{t('title')}</p>
          <p className="text-xs text-[var(--color-muted)]">{t('signedInAs', { name })}</p>
        </div>
        <form action={adminLogout}>
          <button type="submit" className="text-sm font-medium text-[var(--color-muted)] hover:text-primary">
            {t('signOut')}
          </button>
        </form>
      </div>
    </header>
  );
}
