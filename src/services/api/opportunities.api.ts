import { mapOpportunityRow } from '@/services/api/mappers/opportunity.mapper';
import { supabase } from '@/services/supabase/client';
import type { Opportunity } from '@/types/domain/opportunity';

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
    const [{ data, error }, posterRes] = await Promise.all([
      supabase.from('opportunities').select('*').eq('id', id).maybeSingle(),
      supabase.rpc('get_opportunity_poster', { p_opportunity_id: id }),
    ]);

    if (!data) return { data: null, error };

    const opportunity = mapOpportunityRow(data);
    opportunity.postedBy = (posterRes.data as Opportunity['postedBy']) ?? null;
    return { data: opportunity, error };
  },

  /** Opportunity ids ranked by save count across all users (aggregate only, no user linkage). */
  getTrendingIds: async (limit = 10) => {
    const { data, error } = await supabase.rpc('get_trending_opportunities', {
      result_limit: limit,
    });

    if (error) return { data: null, error };

    const ids = (data ?? []).map((row) => row.opportunity_id);
    return { data: ids, error: null };
  },
};
