import { getTranslations } from 'next-intl/server';

import { PartnerOpportunityForm } from '../PartnerOpportunityForm';
import { createPartnerOpportunity } from './actions';

export default async function PartnerCreateOpportunityPage() {
  const t = await getTranslations('Partner.create');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <PartnerOpportunityForm
          action={createPartnerOpportunity}
          submitLabel={t('submit')}
          pendingLabel={t('pending')}
          successMessage={t('success')}
          resetOnSuccess
        />
      </section>
    </div>
  );
}
