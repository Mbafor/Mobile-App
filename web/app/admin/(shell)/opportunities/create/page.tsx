import { getTranslations } from 'next-intl/server';

import { OpportunityForm } from '@/app/opportunities/_shared/OpportunityForm';
import { createAdminOpportunity } from '../actions';

export default async function AdminCreateOpportunityPage() {
  const t = await getTranslations('Admin.opportunities.createForm');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <OpportunityForm
          action={createAdminOpportunity}
          submitLabel={t('submit')}
          pendingLabel={t('pending')}
          successMessage={t('success')}
          resetOnSuccess
        />
      </section>
    </div>
  );
}
