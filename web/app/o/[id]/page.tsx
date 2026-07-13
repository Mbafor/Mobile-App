import { notFound, redirect } from 'next/navigation';

import { createServiceRoleClient } from '@/lib/supabase-server';

const APP_URL = process.env.NEXT_PUBLIC_APP_URL ?? 'https://app.voila-africa.com';

/**
 * Click-attribution gateway, not a page of its own -- logs the ref-coded click
 * server-side (for partner analytics) then forwards straight into the real
 * opportunity view in the app. There is no separate "bridge" UI: every shared
 * opportunity link must land the visitor on the actual app experience.
 */
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
    .select('id')
    .eq('id', id)
    .eq('status', 'approved')
    .eq('is_active', true)
    .maybeSingle();

  if (!opportunity) notFound();

  await supabase.from('link_clicks').insert({
    opportunity_id: opportunity.id,
    ref_code: ref ?? null,
  });

  const appLink = `${APP_URL.replace(/\/$/, '')}/opportunity/${opportunity.id}${ref ? `?ref=${ref}` : ''}`;
  redirect(appLink);
}
