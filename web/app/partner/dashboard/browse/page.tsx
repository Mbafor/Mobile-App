import { requirePartnerSession } from '@/lib/partner-session';
import { createPartnerClient } from '@/lib/supabase-server';
import { OpportunityBrowser, type BrowserOpportunity } from './OpportunityBrowser';

export default async function PartnerBrowsePage() {
  const session = await requirePartnerSession();
  const client = createPartnerClient(session.accessToken);

  const { data } = await client
    .from('opportunities')
    .select('id, title, organization, category, deadline, country')
    .order('deadline', { ascending: true, nullsFirst: false });

  const opportunities: BrowserOpportunity[] = data ?? [];

  return (
    <div>
      <h1 className="text-2xl font-semibold text-[var(--color-forest)] mb-1">Browse Opportunities</h1>
      <p className="text-sm text-[var(--color-muted)] mb-6">
        Browse all active opportunities on Voila and share the ones relevant to your audience.
      </p>

      <section className="bg-white rounded-lg border border-[var(--color-border)] p-4">
        <OpportunityBrowser
          opportunities={opportunities}
          orgName={session.partner.org_name}
          refCode={session.partner.ref_code}
          partnerSlug={session.partner.slug}
        />
      </section>
    </div>
  );
}
