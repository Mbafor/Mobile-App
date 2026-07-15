import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';

import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { PartnerOpportunityForm } from '../../PartnerOpportunityForm';
import { updatePartnerOpportunity } from '../../actions';

export default async function PartnerEditOpportunityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, t] = await Promise.all([requirePartnerSession(), getTranslations('Partner.edit')]);
  const client = createPartnerClient(session.accessToken);

  // Ownership check: partner_posts is the only record of which opportunities
  // this partner posted (opportunities has no partner_id column). The RLS
  // select policy on opportunities would let any partner load an active
  // listing by id, so this guards the edit form itself; the update action
  // is separately enforced at the database layer (migration 050).
  const { data: post } = await client
    .from('partner_posts')
    .select('opportunity_id')
    .eq('partner_id', session.partner.id)
    .eq('opportunity_id', id)
    .maybeSingle();

  if (!post) notFound();

  const { data: opportunity } = await client
    .from('opportunities')
    .select(
      'id, title, organization, description, image_url, apply_url, deadline, category, tags, country, funding_type, degree_levels, location_type',
    )
    .eq('id', id)
    .maybeSingle();

  if (!opportunity) notFound();

  const boundUpdate = updatePartnerOpportunity.bind(null, id);

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <PartnerOpportunityForm
          action={boundUpdate}
          initialValues={{
            title: opportunity.title,
            organization: opportunity.organization,
            description: opportunity.description ?? '',
            imageUrl: opportunity.image_url ?? '',
            applyUrl: opportunity.apply_url ?? '',
            deadline: opportunity.deadline ? opportunity.deadline.slice(0, 10) : '',
            category: opportunity.category ?? '',
            tags: (opportunity.tags ?? []).filter((t: string) => t !== opportunity.category),
            country: opportunity.country ?? '',
            fundingType: opportunity.funding_type ?? '',
            degreeLevels: opportunity.degree_levels ?? [],
            locationType: opportunity.location_type ?? '',
          }}
          submitLabel={t('submit')}
          pendingLabel={t('pending')}
          successMessage={t('success')}
        />
      </section>
    </div>
  );
}
