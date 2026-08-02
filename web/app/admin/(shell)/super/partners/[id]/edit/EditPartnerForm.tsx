'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { updatePartner } from '../../actions';

const inputClass =
  'w-full rounded-md border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-forest)]';

export function EditPartnerForm({
  partnerId,
  initialValues,
  slug,
  refCode,
}: {
  partnerId: string;
  initialValues: { orgName: string; contactEmail: string; logoUrl: string };
  slug: string;
  refCode: string;
}) {
  const t = useTranslations('Admin.superAdmin.partners');
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  function handleSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    startTransition(async () => {
      const result = await updatePartner(partnerId, formData);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      setSuccess(true);
      router.refresh();
    });
  }

  return (
    <form action={handleSubmit} className="space-y-4">
      {error && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      {success && (
        <p className="text-sm text-[var(--color-forest)] bg-[var(--color-forest)]/10 border border-[var(--color-forest)]/30 rounded-md px-3 py-2">
          {t('saveSuccess')}
        </p>
      )}

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="orgName">
          {t('orgNamePlaceholder')}
        </label>
        <input id="orgName" name="orgName" required defaultValue={initialValues.orgName} className={inputClass} />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="contactEmail">
          {t('emailPlaceholder')}
        </label>
        <input
          id="contactEmail"
          name="contactEmail"
          type="email"
          required
          defaultValue={initialValues.contactEmail}
          autoCapitalize="none"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1" htmlFor="logoUrl">
          {t('logoUrlLabel')}
        </label>
        <input
          id="logoUrl"
          name="logoUrl"
          defaultValue={initialValues.logoUrl}
          placeholder="https://..."
          autoCapitalize="none"
          className={inputClass}
        />
      </div>

      <div className="rounded-md bg-[var(--color-surface)] px-3 py-2 text-xs text-[var(--color-muted)] space-y-1">
        <p>{t('slugReadonly', { slug })}</p>
        <p>{t('refCodeReadonly', { refCode })}</p>
      </div>

      <button
        type="submit"
        disabled={isPending}
        className="rounded-md bg-primary text-white px-4 py-2 text-sm font-medium disabled:opacity-50 hover:opacity-90 transition"
      >
        {isPending ? t('saving') : t('save')}
      </button>
    </form>
  );
}
