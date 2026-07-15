import { getTranslations } from 'next-intl/server';

import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { StatsPanel } from './StatsPanel';
import { ShareTools } from './ShareTools';
import { ManageOpportunitiesList } from './ManageOpportunitiesList';
import type { ShareableOpportunity } from '@/lib/partner-share-template';

export default async function PartnerDashboardPage() {
  const [session, t] = await Promise.all([requirePartnerSession(), getTranslations('Partner.dashboard')]);
  const client = createPartnerClient(session.accessToken);

  const [postsRes, postsCountRes, clicksCountRes] = await Promise.all([
    client
      .from('partner_posts')
      .select('opportunity_id, opportunities(id, title, organization, deadline)')
      .order('posted_at', { ascending: false })
      .limit(200),
    client.from('partner_posts').select('id', { count: 'exact', head: true }),
    client.from('link_clicks').select('id', { count: 'exact', head: true }),
  ]);

  const posts = (postsRes.data ?? []) as unknown as Array<{
    opportunity_id: string;
    opportunities: ShareableOpportunity | null;
  }>;
  const postedOpportunities: ShareableOpportunity[] = posts
    .map((row) => row.opportunities)
    .filter((opp): opp is ShareableOpportunity => Boolean(opp));

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-[var(--color-forest)]">{session.partner.org_name}</h1>
        <p className="text-sm text-[var(--color-muted)]">{t('subtitle')}</p>
      </div>

      <StatsPanel postsCount={postsCountRes.count ?? 0} clicksCount={clicksCountRes.count ?? 0} />

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4 mb-6">
        <h2 className="text-lg font-medium mb-3">{t('postedOpportunities')}</h2>
        <ManageOpportunitiesList opportunities={postedOpportunities} />
      </section>

      <section className="bg-[var(--color-background)] rounded-lg border border-[var(--color-border)] p-4">
        <h2 className="text-lg font-medium mb-3">{t('shareTools')}</h2>
        <ShareTools
          orgName={session.partner.org_name}
          refCode={session.partner.ref_code}
          partnerSlug={session.partner.slug}
          posts={postedOpportunities}
        />
      </section>
    </div>
  );
}
