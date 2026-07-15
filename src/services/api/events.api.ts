import { mapEventRow } from '@/services/api/mappers/event.mapper';
import { supabase } from '@/services/supabase/client';

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

    return { data: (data ?? []).map(mapEventRow), error: null };
  },

  listPast: async () => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .neq('status', 'cancelled')
      .lt('event_date', new Date().toISOString())
      .order('event_date', { ascending: false });

    if (error) return { data: null, error };

    return { data: (data ?? []).map(mapEventRow), error: null };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('events')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data ? mapEventRow(data) : null, error };
  },
};
