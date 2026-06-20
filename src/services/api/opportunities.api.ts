import { mapOpportunityRow } from '@/services/api/mappers/opportunity.mapper';
import { supabase } from '@/services/supabase/client';

/** Opportunities — only non-expired rows (deadline > now) via RLS. */
export const opportunitiesApi = {
  listActive: async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };

    const opportunities = (data ?? []).map(mapOpportunityRow);
    return { data: opportunities, error: null };
  },

  getById: async (id: string) => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    return { data: data ? mapOpportunityRow(data) : null, error };
  },
};
