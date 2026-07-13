import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { StatsPanel } from './StatsPanel';
import { ShareTools } from './ShareTools';
import type { ShareableOpportunity } from '@/lib/partner-share-template';

export default async function PartnerDashboardPage() {
  const session = await requirePartnerSession();
  const client = createPartnerClient(session.accessToken);

  const [postsRes, postsCountRes, clicksCountRes] = await Promise.all([
    client
      .from('partner_posts')
      .select('opportunity_id, opportunities(id, title, organization, deadline)')
      .order('posted_at', { ascending: false }),
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
        <p className="text-sm text-[var(--color-muted)]">Partner dashboard</p>
      </div>

      <StatsPanel postsCount={postsCountRes.count ?? 0} clicksCount={clicksCountRes.count ?? 0} />

      <section className="bg-white rounded-lg border border-[var(--color-border)] p-4">
        <h2 className="text-lg font-medium mb-3">Your posted opportunities</h2>
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
