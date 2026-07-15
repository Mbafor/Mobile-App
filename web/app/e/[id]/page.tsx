import { notFound, redirect } from 'next/navigation';

import { createServiceRoleClient } from '@/lib/supabase-server';

/**
 * Click-attribution gateway for events -- logs the ref-coded click server-side
 * (for partner analytics, mirroring web/app/o/[id]/page.tsx for opportunities)
 * then forwards straight to the event's external registration link. Unlike
 * the opportunities bridge (which forwards into the app's own opportunity
 * view), events have no in-app registration flow -- register_link is always
 * an external form/page, so that's the only sensible redirect target.
 */
export default async function EventBridgePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ ref?: string }>;
}) {
  const { id } = await params;
  const { ref } = await searchParams;

  const supabase = createServiceRoleClient();

  const { data: event } = await supabase
    .from('events')
    .select('id, register_link')
    .eq('id', id)
    .neq('status', 'cancelled')
    .maybeSingle();

  if (!event) notFound();

  await supabase.from('event_link_clicks').insert({
    event_id: event.id,
    ref_code: ref ?? null,
  });

  redirect(event.register_link);
}
