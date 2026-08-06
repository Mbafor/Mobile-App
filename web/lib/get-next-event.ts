import { createServiceRoleClient } from '@/lib/supabase-server';

export interface NextEvent {
  slug: string;
  title: string;
  event_date: string;
  timezone: string;
}

/** Soonest upcoming, non-cancelled event -- used to promote registration
 * site-wide (banner) without every caller re-writing the same query. */
export async function getNextEvent(): Promise<NextEvent | null> {
  const supabase = createServiceRoleClient();
  const { data } = await supabase
    .from('events')
    .select('slug, title, event_date, timezone')
    .neq('status', 'cancelled')
    .not('slug', 'is', null)
    .gte('event_date', new Date().toISOString())
    .order('event_date', { ascending: true })
    .limit(1)
    .maybeSingle();

  return data ?? null;
}
