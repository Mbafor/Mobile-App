import { supabase } from '@/services/supabase/client';

export type SavedOpportunityRow = {
  opportunityId: string;
  createdAt: string;
};

export const savedOpportunitiesApi = {
  listSaved: async (userId: string) => {
    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('opportunity_id, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) return { data: null, error };

    const rows: SavedOpportunityRow[] = (data ?? []).map((row) => ({
      opportunityId: row.opportunity_id,
      createdAt: row.created_at,
    }));
    return { data: rows, error: null };
  },

  listOpportunityIds: async (userId: string) => {
    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('opportunity_id')
      .eq('user_id', userId);

    if (error) return { data: null, error };

    const ids = (data ?? []).map((row) => row.opportunity_id);
    return { data: ids, error: null };
  },

  isSaved: async (userId: string, opportunityId: string) => {
    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('opportunity_id')
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    return { saved: Boolean(data), error };
  },

  save: async (userId: string, opportunityId: string) => {
    const { error } = await supabase
      .from('saved_opportunities')
      .insert({ user_id: userId, opportunity_id: opportunityId });

    return { error };
  },

  countByUser: async (userId: string) => {
    const { count, error } = await supabase
      .from('saved_opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return { count: count ?? 0, error };
  },

  unsave: async (userId: string, opportunityId: string) => {
    const { error } = await supabase
      .from('saved_opportunities')
      .delete()
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId);

    return { error };
  },
};
