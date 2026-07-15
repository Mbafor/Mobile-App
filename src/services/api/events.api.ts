import { mapEventRow } from '@/services/api/mappers/event.mapper';
import { supabase } from '@/services/supabase/client';
import type { Event } from '@/types/domain/event';

async function attachPosters(events: Event[]): Promise<Event[]> {
  if (events.length === 0) return events;

  const { data } = await supabase.rpc('get_events_posters', {
    p_event_ids: events.map((event) => event.id),
  });

  const posterByEventId = new Map(
    (data ?? []).map((row) => [row.event_id, { name: row.name, kind: row.kind } as Event['postedBy']]),
  );

  return events.map((event) => ({
    ...event,
    postedBy: posterByEventId.get(event.id) ?? null,
  }));
}

/** Events -- publishes immediately, same trust model as opportunities. */
export const eventsApi = {
  listUpcoming: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .neq('status', 'cancelled')
      .gte('event_date', new Date().toISOString())
      .order('event_date', { ascending: true });

    if (error) return { data: null, error };

    return { data: await attachPosters((data ?? []).map(mapEventRow)), error: null };
  },

  listPast: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .neq('status', 'cancelled')
      .lt('event_date', new Date().toISOString())
      .order('event_date', { ascending: false });

    if (error) return { data: null, error };

    return { data: await attachPosters((data ?? []).map(mapEventRow)), error: null };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (!data) return { data: null, error };

    const [event] = await attachPosters([mapEventRow(data)]);
    return { data: event, error };
  },
};
