import { notFound } from 'next/navigation';
import type { Metadata } from 'next';

import { createServiceRoleClient } from '@/lib/supabase-server';

interface DigestOpportunityRow {
  id: string;
  title: string;
  organization: string;
  deadline: string | null;
}

async function getDigestOpportunities(slug: string): Promise<DigestOpportunityRow[] | null> {
  const supabase = createServiceRoleClient();

  const { data: digest } = await supabase
    .from('sent_digests')
    .select('opportunity_ids')
    .eq('slug', slug)
    .order('sent_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!digest) return null;

  const { data: opportunities } = await supabase
    .from('opportunities')
    .select('id, title, organization, deadline')
    .in('id', digest.opportunity_ids);

  return opportunities ?? [];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const opportunities = await getDigestOpportunities(slug);

  const title = `Voila Weekly Digest — ${slug}`;
  const description = opportunities?.length
    ? `${opportunities.length} opportunities: ${opportunities
        .slice(0, 3)
        .map((o) => o.title)
        .join(', ')}${opportunities.length > 3 ? ', and more' : ''}`
    : 'This week\'s opportunities from Voila Africa.';

  return { title, description, openGraph: { title, description } };
}

export default async function DigestPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const opportunities = await getDigestOpportunities(slug);

  if (!opportunities) notFound();

  return (
    <main className="min-h-screen bg-[var(--color-surface)] px-4 py-10">
      <div className="max-w-2xl mx-auto">
        <header className="mb-8">
          <p className="text-lg font-semibold text-[var(--color-forest)]">Voila Africa</p>
          <h1 className="text-2xl font-semibold">Weekly Digest — {slug}</h1>
        </header>

        <div className="space-y-3">
          {opportunities.length === 0 && (
            <p className="text-sm text-[var(--color-muted)]">No opportunities in this digest.</p>
          )}
          {opportunities.map((opp) => (
            <a
              key={opp.id}
              href={`/o/${opp.id}`}
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
