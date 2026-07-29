import { getTranslations } from 'next-intl/server';

import { EventForm } from '@/app/events/_shared/EventForm';
import { createAdminEvent } from '../actions';

export default async function AdminCreateEventPage() {
  const t = await getTranslations('Admin.events.createForm');

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <EventForm
          action={createAdminEvent}
          submitLabel={t('submit')}
          pendingLabel={t('pending')}
          successMessage={t('success')}
          resetOnSuccess
        />
      </section>
    </div>
  );
}
