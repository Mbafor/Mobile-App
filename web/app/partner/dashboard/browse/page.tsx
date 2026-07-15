import { getTranslations } from 'next-intl/server';

import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { OpportunityBrowser, type BrowserOpportunity } from './OpportunityBrowser';

export default async function PartnerBrowsePage() {
  const [session, t] = await Promise.all([requirePartnerSession(), getTranslations('Partner.browse')]);
  const client = createPartnerClient(session.accessToken);

  const { data } = await client
    .from('opportunities')
    .select(
      'id, title, organization, description, category, deadline, country, location_type, funding_type, apply_url, tags, image_url',
    )
    .order('deadline', { ascending: true, nullsFirst: false });

  const opportunities: BrowserOpportunity[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">{t('title')}</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">{t('subtitle')}</p>

      <OpportunityBrowser opportunities={opportunities} refCode={session.partner.ref_code} />
    </div>
  );
}
