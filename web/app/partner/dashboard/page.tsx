import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient, createServiceRoleClient } from '@/lib/supabase-server';
import { partnerLogout } from '@/app/partner/login/actions';
import { OpportunityBrowser, type BrowserOpportunity } from './OpportunityBrowser';
import { StatsPanel } from './StatsPanel';
import { ShareTools } from './ShareTools';
import { AdminDigestSection } from './AdminDigestSection';
import type { ShareableOpportunity } from '@/lib/partner-share-template';

export default async function PartnerDashboardPage() {
  const session = await requirePartnerSession();
  const client = createPartnerClient(session.accessToken);

  const [opportunitiesRes, postsRes, postsCountRes, clicksCountRes, latestDigestRes] = await Promise.all([
    client
      .from('opportunities')
      .select('id, title, organization, category, deadline, country')
      .order('deadline', { ascending: true, nullsFirst: false }),
    client
      .from('partner_posts')
      .select('opportunity_id, opportunities(id, title, organization, deadline)')
      .order('posted_at', { ascending: false }),
    client.from('partner_posts').select('id', { count: 'exact', head: true }),
    client.from('link_clicks').select('id', { count: 'exact', head: true }),
    createServiceRoleClient()
      .from('sent_digests')
      .select('slug, opportunity_ids')
      .order('sent_at', { ascending: false })
      .limit(1)
      .maybeSingle(),
  ]);

  const opportunities: BrowserOpportunity[] = opportunitiesRes.data ?? [];
  const postedIds = (postsRes.data ?? []).map((row) => row.opportunity_id);
  const posts = (postsRes.data ?? []) as unknown as Array<{
    opportunity_id: string;
    opportunities: ShareableOpportunity | null;
  }>;
  const postedOpportunities: ShareableOpportunity[] = posts
    .map((row) => row.opportunities)
    .filter((opp): opp is ShareableOpportunity => Boolean(opp));

  const latestDigestSlug = latestDigestRes.data?.slug ?? null;
  let latestDigestOpportunities: ShareableOpportunity[] = [];
  if (latestDigestRes.data?.opportunity_ids?.length) {
    const { data: digestOpps } = await createServiceRoleClient()
      .from('opportunities')
      .select('id, title, organization, deadline')
      .in('id', latestDigestRes.data.opportunity_ids);
    latestDigestOpportunities = digestOpps ?? [];
  }

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-forest)]">{session.partner.org_name}</h1>
            <p className="text-sm text-[var(--color-muted)]">Partner dashboard</p>
          </div>
          <form action={partnerLogout}>
            <button type="submit" className="text-sm text-[var(--color-muted)] underline">
              Log out
            </button>
          </form>
        </div>

        <StatsPanel postsCount={postsCountRes.count ?? 0} clicksCount={clicksCountRes.count ?? 0} />

        <section className="bg-white rounded-lg border border-[var(--color-border)] p-4 mb-6">
          <h2 className="text-lg font-medium mb-3">This Week&apos;s Digest</h2>
          <AdminDigestSection
            orgName={session.partner.org_name}
            refCode={session.partner.ref_code}
            partnerSlug={session.partner.slug}
            digestSlug={latestDigestSlug}
            opportunities={latestDigestOpportunities}
          />
        </section>

        <section className="bg-white rounded-lg border border-[var(--color-border)] p-4 mb-6">
          <h2 className="text-lg font-medium mb-3">Share your posted opportunities</h2>
          <ShareTools
            orgName={session.partner.org_name}
            refCode={session.partner.ref_code}
            partnerSlug={session.partner.slug}
            posts={postedOpportunities}
          />
        </section>

        <section className="bg-white rounded-lg border border-[var(--color-border)] p-4">
          <h2 className="text-lg font-medium mb-3">Browse opportunities</h2>
          <OpportunityBrowser opportunities={opportunities} postedIds={postedIds} />
        </section>
      </div>
    </main>
  );
}
