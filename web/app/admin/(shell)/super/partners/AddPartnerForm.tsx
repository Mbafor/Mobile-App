'use client';

import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { createPartner } from './actions';

export function AddPartnerForm() {
  const t = useTranslations('Admin.superAdmin.partners');
  const [orgName, setOrgName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [slug, setSlug] = useState('');
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<{ tempPassword: string; slug: string } | null>(null);

  function handleSubmit(formData: FormData) {
    setError(null);
    setCreated(null);
    startTransition(async () => {
      const result = await createPartner(formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setCreated({ tempPassword: result.tempPassword, slug: result.slug });
      setOrgName('');
      setContactEmail('');
      setSlug('');
    });
  }

  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-4 mb-4">
      <p className="text-sm font-semibold mb-2">{t('addCardLabel')}</p>

      {created ? (
        <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-3 text-sm space-y-2">
          <p className="font-medium text-amber-900">{t('createdTitle', { slug: created.slug })}</p>
          <p className="text-amber-800">{t('createdHint')}</p>
          <div className="flex items-center gap-2">
            <code className="rounded bg-white border border-amber-300 px-2 py-1 font-mono text-xs">
              {created.tempPassword}
            </code>
            <button
              type="button"
              onClick={() => navigator.clipboard.writeText(created.tempPassword)}
              className="rounded-md border border-amber-300 px-2 py-1 text-xs font-medium hover:bg-amber-100 transition"
            >
              {t('copyPassword')}
            </button>
          </div>
          <button
            type="button"
            onClick={() => setCreated(null)}
            className="text-xs font-medium text-amber-900 hover:underline"
          >
            {t('dismiss')}
          </button>
        </div>
      ) : (
        <form action={handleSubmit} className="space-y-3">
          <div className="flex flex-wrap gap-3">
            <input
              name="orgName"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder={t('orgNamePlaceholder')}
              className="flex-1 min-w-[180px] rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
            />
            <input
              name="contactEmail"
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              placeholder={t('emailPlaceholder')}
              autoCapitalize="none"
              className="flex-1 min-w-[180px] rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
            />
            <input
              name="slug"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder={t('slugPlaceholder')}
              autoCapitalize="none"
              className="flex-1 min-w-[140px] rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm"
            />
            <button
              type="submit"
              disabled={!orgName.trim() || !contactEmail.trim() || isPending}
              className="rounded-md bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
            >
              {isPending ? t('creating') : t('add')}
            </button>
          </div>
          <p className="text-xs text-[var(--color-muted)]">{t('addHint')}</p>
          {error && <p className="text-sm text-red-600">{error}</p>}
        </form>
      )}
    </div>
  );
}
