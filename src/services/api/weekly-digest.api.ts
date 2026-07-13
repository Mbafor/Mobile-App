import { supabase } from '@/services/supabase/client';

export interface WeeklyDigestCandidate {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  category: string | null;
  country: string | null;
  deadline: string | null;
  lastSentAt: string | null;
  timesSent: number;
}

function mapCandidateRow(row: {
  id: string;
  title: string;
  organization: string;
  description: string | null;
  category: string | null;
  country: string | null;
  deadline: string | null;
  last_sent_at: string | null;
  times_sent: number;
}): WeeklyDigestCandidate {
  return {
    id: row.id,
    title: row.title,
    organization: row.organization,
    description: row.description,
    category: row.category,
    country: row.country,
    deadline: row.deadline,
    lastSentAt: row.last_sent_at,
    timesSent: row.times_sent,
  };
}

/** Admin-only operations — enforced by RLS and the same current_user_can_manage_opportunities() check as the rest of admin.api.ts. */
export const weeklyDigestApi = {
  listCandidates: async () => {
    const { data, error } = await supabase
      .from('opportunities')
      .select('id, title, organization, description, category, country, deadline, last_sent_at, times_sent')
      .eq('status', 'approved')
      .eq('is_active', true)
      .order('deadline', { ascending: true, nullsFirst: false });

    if (error) return { data: null, error };
    return { data: (data ?? []).map(mapCandidateRow), error: null };
  },

  publishDigest: async (opportunityIds: string[], channel: string, slug: string) => {
    const { error: bumpError } = await supabase.rpc('bump_opportunity_sends', { p_ids: opportunityIds });
    if (bumpError) return { error: bumpError };

    const {
      data: { user },
    } = await supabase.auth.getUser();

    const { error: insertError } = await supabase.from('sent_digests').insert({
      slug,
      opportunity_ids: opportunityIds,
      channel,
      created_by: user?.id ?? null,
    });

    return { error: insertError };
  },
};
