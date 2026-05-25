import { supabase } from '@/services/supabase/client';
import type { TrackerStage } from '@/types/domain/tracker';
import { isAppliedOrBeyond } from '@/types/domain/tracker';

export type TrackerRow = {
  opportunityId: string;
  stage: TrackerStage;
  notes: string;
  savedAt: string;
  updatedAt: string;
};

async function syncAppliedFlag(
  userId: string,
  opportunityId: string,
  stage: TrackerStage,
): Promise<{ error: Error | null }> {
  if (isAppliedOrBeyond(stage)) {
    const { error } = await supabase.from('applied_opportunities').insert({
      user_id: userId,
      opportunity_id: opportunityId,
    });
    if (error && error.code !== '23505') {
      return { error: error as Error };
    }
    return { error: null };
  }

  const { error } = await supabase
    .from('applied_opportunities')
    .delete()
    .eq('user_id', userId)
    .eq('opportunity_id', opportunityId);

  return { error: error as Error | null };
}

export const trackerApi = {
  listTracked: async (userId: string) => {
    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('opportunity_id, stage, notes, created_at, updated_at')
      .eq('user_id', userId)
      .order('updated_at', { ascending: false });

    if (error) return { data: null, error };

    const rows: TrackerRow[] = (data ?? []).map((row) => ({
      opportunityId: row.opportunity_id,
      stage: (row.stage ?? 'saved') as TrackerStage,
      notes: row.notes ?? '',
      savedAt: row.created_at,
      updatedAt: row.updated_at ?? row.created_at,
    }));

    return { data: rows, error: null };
  },

  updateStage: async (userId: string, opportunityId: string, stage: TrackerStage) => {
    const { error: updateError } = await supabase
      .from('saved_opportunities')
      .update({ stage, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId);

    if (updateError) return { error: updateError };

    return syncAppliedFlag(userId, opportunityId, stage);
  },

  updateNotes: async (userId: string, opportunityId: string, notes: string) => {
    const { error } = await supabase
      .from('saved_opportunities')
      .update({ notes, updated_at: new Date().toISOString() })
      .eq('user_id', userId)
      .eq('opportunity_id', opportunityId);

    return { error };
  },
};
