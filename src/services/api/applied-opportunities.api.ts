import { supabase } from '@/services/supabase/client';

export const appliedOpportunitiesApi = {
  isApplied: async (userId: string, opportunityId: string) => {
    const { data, error } = await supabase
      .from('applied_opportunities')
      .select('opportunity_id')
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId)
      .maybeSingle();

    return { applied: Boolean(data), error };
  },

  markApplied: async (userId: string, opportunityId: string) => {
    const { error } = await supabase.from('applied_opportunities').insert({
      user_id: userId,
      opportunity_id: opportunityId,
    });

    return { error };
  },

  countByUser: async (userId: string) => {
    const { count, error } = await supabase
      .from('applied_opportunities')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    return { count: count ?? 0, error };
  },

  unmarkApplied: async (userId: string, opportunityId: string) => {
    const { error } = await supabase
      .from('applied_opportunities')
      .delete()
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId);

    return { error };
  },
};
