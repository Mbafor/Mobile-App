import { notFound } from 'next/navigation';

import { createServiceRoleClient } from '@/lib/supabase-server';
import { RESERVED_PARTNER_SLUGS } from '@/lib/partner-slugs';

export default async function PublicPartnerPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  if (RESERVED_PARTNER_SLUGS.has(slug)) notFound();

  const supabase = createServiceRoleClient();

  const { data: partner } = await supabase
    .from('partners')
    .select('id, org_name, slug, logo_url, ref_code')
    .eq('slug', slug)
    .eq('is_active', true)
    .maybeSingle();

  if (!partner) notFound();

  const { data: posts } = await supabase
    .from('partner_posts')
    .select('opportunity_id, posted_at, opportunities(id, title, organization, deadline)')
    .eq('partner_id', partner.id)
    .order('posted_at', { ascending: false });

  type PostedOpportunity = { id: string; title: string; organization: string; deadline: string | null };
  const typedPosts = (posts ?? []) as unknown as Array<{ opportunities: PostedOpportunity | null }>;
  const opportunities = typedPosts
    .map((row) => row.opportunities)
    .filter((opp): opp is PostedOpportunity => Boolean(opp));

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="flex items-center gap-4 mb-8">
          <span className="text-lg font-semibold text-[var(--color-forest)]">Voila Africa</span>
          <span className="text-[var(--color-border)]">×</span>
          {partner.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={partner.logo_url} alt={partner.org_name} className="h-8 w-auto" />
          ) : (
            <span className="text-lg font-semibold">{partner.org_name}</span>
          )}
        </header>

        <p className="text-sm text-[var(--color-muted)] mb-6">
          Opportunities shared by <strong>{partner.org_name}</strong>, in partnership with Voila Africa.
        </p>

        <div className="space-y-3">
          {opportunities.length === 0 && (
            <p className="text-sm text-[var(--color-muted)]">No opportunities posted yet — check back soon.</p>
          )}
          {opportunities.map((opp) => (
            <a
              key={opp.id}
              href={`/o/${opp.id}?ref=${partner.ref_code}`}
              className="block bg-white rounded-lg border border-[var(--color-border)] p-4 hover:border-[var(--color-forest)] transition"
            >
              <p className="font-medium">{opp.title}</p>
              <p className="text-sm text-[var(--color-muted)]">
                {opp.organization}
                {opp.deadline
                  ? ` · Deadline ${new Date(opp.deadline).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                    })}`
                  : ' · Rolling'}
              </p>
            </a>
          ))}
        </div>
      </div>
    </main>
  );
}
