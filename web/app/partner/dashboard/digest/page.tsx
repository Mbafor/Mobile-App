import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { PartnerDigestBuilder, type PastDigestGroup } from './PartnerDigestBuilder';
import type { ShareableOpportunity } from '@/lib/partner-share-template';
import type { BrowserOpportunity } from '../browse/OpportunityBrowser';

export default async function PartnerDigestPage() {
  const session = await requirePartnerSession();
  const client = createPartnerClient(session.accessToken);

  const [opportunitiesRes, postsRes] = await Promise.all([
    client
      .from('opportunities')
      .select('id, title, organization, category, deadline, country')
      .order('deadline', { ascending: true, nullsFirst: false }),
    client
      .from('partner_posts')
      .select('digest_slug, posted_at, opportunities(id, title, organization, deadline)')
      .not('digest_slug', 'is', null)
      .order('posted_at', { ascending: false }),
  ]);

  const opportunities: BrowserOpportunity[] = opportunitiesRes.data ?? [];

  type PostRow = {
    digest_slug: string | null;
    posted_at: string;
    opportunities: ShareableOpportunity | null;
  };
  const posts = (postsRes.data ?? []) as unknown as PostRow[];

  const groups = new Map<string, PastDigestGroup>();
  for (const row of posts) {
    if (!row.digest_slug || !row.opportunities) continue;
    const existing = groups.get(row.digest_slug);
    if (existing) {
      existing.opportunities.push(row.opportunities);
    } else {
      groups.set(row.digest_slug, {
        slug: row.digest_slug,
        postedAt: row.posted_at,
        opportunities: [row.opportunities],
      });
    }
  }
  const pastDigests = Array.from(groups.values()).sort(
    (a, b) => new Date(b.postedAt).getTime() - new Date(a.postedAt).getTime(),
  );

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">Weekly Digest</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        Curate your own set of opportunities to share as this week&apos;s digest.
      </p>

      <section className="bg-white rounded-lg border border-[var(--color-border)] p-4">
        <PartnerDigestBuilder
          opportunities={opportunities}
          pastDigests={pastDigests}
          orgName={session.partner.org_name}
          refCode={session.partner.ref_code}
          partnerSlug={session.partner.slug}
        />
      </section>
    </div>
  );
}
