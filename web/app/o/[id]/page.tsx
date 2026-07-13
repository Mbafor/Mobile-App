import { notFound } from 'next/navigation';

import { createServiceRoleClient } from '@/lib/supabase-server';

export default async function BridgePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { id } = await params;
  const { ref } = await searchParams;

  const supabase = createServiceRoleClient();

  const { data: opportunity } = await supabase
    .from('opportunities')
    .select('id, title, organization, description, deadline, apply_url')
    .eq('id', id)
    .eq('status', 'approved')
    .eq('is_active', true)
    .maybeSingle();

  if (!opportunity) notFound();

  await supabase.from('link_clicks').insert({
    opportunity_id: opportunity.id,
    ref_code: ref ?? null,
  });

  const deadlineLabel = opportunity.deadline
    ? new Date(opportunity.deadline).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Rolling / no fixed deadline';

  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--color-surface)] px-4">
      <div className="w-full max-w-lg bg-white rounded-xl border border-[var(--color-border)] p-8 shadow-sm">
        <p className="text-xs uppercase tracking-wide text-[var(--color-muted)] mb-2">Voila Africa</p>
        <h1 className="text-2xl font-semibold mb-2">{opportunity.title}</h1>
        <p className="text-[var(--color-muted)] mb-1">{opportunity.organization}</p>
        <p className="text-sm text-[var(--color-muted)] mb-4">Deadline: {deadlineLabel}</p>

        {opportunity.description && (
          <p className="text-sm text-gray-700 mb-6 line-clamp-4">{opportunity.description}</p>
        )}

        <a
          href={opportunity.apply_url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-block rounded-md bg-[var(--color-forest)] text-white px-5 py-2.5 text-sm font-medium hover:opacity-90 transition"
        >
          Apply Now
        </a>
      </div>
    </main>
  );
}
