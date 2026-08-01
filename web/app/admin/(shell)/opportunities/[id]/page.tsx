import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { requireAdminSession } from '@/lib/admin-session';
import { createUserClient } from '@/lib/supabase-server';
import { updateAdminOpportunity, updateAndApproveAdminOpportunity } from '../actions';
import { ReviewOpportunityForm } from './ReviewOpportunityForm';

export default async function AdminOpportunityReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, t] = await Promise.all([requireAdminSession(), getTranslations('Admin.opportunities.reviewForm')]);
  const client = createUserClient(session.accessToken);

  const { data: opportunity } = await client
    .from('opportunities')
    .select(
      'id, title, organization, description, benefits, image_url, apply_url, deadline, category, tags, country, funding_type, degree_levels, location_type, status',
    )
    .eq('id', id)
    .maybeSingle();

  if (!opportunity) notFound();

  const isPendingReview = opportunity.status === 'pending';
  const boundAction = isPendingReview
    ? updateAndApproveAdminOpportunity.bind(null, id)
    : updateAdminOpportunity.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-primary mb-1">
        {isPendingReview ? t('titlePending') : t('titleApproved')}
      </h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        {isPendingReview ? t('subtitlePending') : t('subtitleApproved')}
      </p>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <ReviewOpportunityForm
          opportunityId={id}
          status={opportunity.status}
          initialValues={{
            title: opportunity.title,
            organization: opportunity.organization,
            description: opportunity.description ?? '',
            benefits: opportunity.benefits ?? '',
            imageUrl: opportunity.image_url ?? '',
            applyUrl: opportunity.apply_url ?? '',
            deadline: opportunity.deadline ? opportunity.deadline.slice(0, 10) : '',
            category: opportunity.category ?? '',
            tags: (opportunity.tags ?? []).filter((tag: string) => tag !== opportunity.category),
            country: opportunity.country ?? '',
            fundingType: opportunity.funding_type ?? '',
            degreeLevels: opportunity.degree_levels ?? [],
            locationType: opportunity.location_type ?? '',
          }}
          action={boundAction}
        />
      </section>
    </div>
  );
}
