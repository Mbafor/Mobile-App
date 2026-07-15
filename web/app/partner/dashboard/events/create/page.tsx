import { getTranslations } from 'next-intl/server';

import { PartnerEventForm } from '../PartnerEventForm';
import { createPartnerEvent } from './actions';

export default async function PartnerCreateEventPage() {
  const t = await getTranslations('Partner.events.create');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <PartnerEventForm
          action={createPartnerEvent}
          submitLabel={t('submit')}
          pendingLabel={t('pending')}
          successMessage={t('success')}
          resetOnSuccess
        />
      </section>
    </div>
  );
}
