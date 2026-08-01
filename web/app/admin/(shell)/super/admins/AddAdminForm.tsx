'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { promoteAdminByEmail } from './actions';

export function AddAdminForm() {
  const t = useTranslations('Admin.superAdmin.admins');
  const [email, setEmail] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = email.trim();
    if (!trimmed.includes('@') || !trimmed.includes('.')) {
      setError(t('invalidEmailMessage'));
      return;
    }
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await promoteAdminByEmail(trimmed);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setEmail('');
      setSuccess(true);
    });
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 mb-4">
      <p className="text-sm font-semibold mb-2">{t('addCardLabel')}</p>
      <div className="flex flex-wrap gap-3">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder={t('emailPlaceholder')}
          autoCapitalize="none"
          className="flex-1 min-w-[220px] rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={!email.trim() || isPending}
          className="rounded-md bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
        >
          {t('add')}
        </button>
      </div>
      <p className="text-xs text-[var(--color-muted)] mt-2">{t('addHint')}</p>
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
      {success && <p className="text-sm text-primary mt-2">{t('promoteSuccessMessage')}</p>}
    </form>
  );
}
