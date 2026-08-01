'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { useTranslations } from 'next-intl';

import { OpportunityForm, type OpportunityFormResult, type OpportunityFormValues } from '@/app/opportunities/_shared/OpportunityForm';
import { rejectAdminOpportunity } from '../actions';

export function ReviewOpportunityForm({
  opportunityId,
  status,
  initialValues,
  action,
}: {
  opportunityId: string;
  status: string;
  initialValues: Partial<OpportunityFormValues>;
  action: (formData: FormData) => Promise<OpportunityFormResult>;
}) {
  const t = useTranslations('Admin.opportunities.reviewForm');
  const router = useRouter();
  const [isRejecting, startReject] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isPendingReview = status === 'pending';

  function handleReject() {
    if (!window.confirm(t('confirmReject', { title: initialValues.title ?? '' }))) return;
    setError(null);
    startReject(async () => {
      const result = await rejectAdminOpportunity(opportunityId);
      if (!result.ok) {
        setError(result.message);
        return;
      }
      router.push('/admin/opportunities/pending');
    });
  }

  return (
    <div>
      {error && (
        <p className="mb-4 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">{error}</p>
      )}
      <OpportunityForm
        action={action}
        initialValues={initialValues}
        submitLabel={isPendingReview ? t('submitApprove') : t('submitSave')}
        pendingLabel={t('pending')}
        successMessage={isPendingReview ? t('successApprove') : t('success')}
        secondaryAction={
          isPendingReview
            ? {
                label: t('reject'),
                pendingLabel: t('rejecting'),
                onClick: handleReject,
                destructive: true,
                disabled: isRejecting,
              }
            : undefined
        }
      />
    </div>
  );
}
