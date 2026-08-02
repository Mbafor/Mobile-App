import { supabase } from '@/services/supabase/client';

export const mentorshipPromptApi = {
  /** Whether this user has already been shown the "join mentorship" prompt. */
  getPromptStatus: async (userId: string): Promise<{ seen: boolean; error: Error | null }> => {
    const { data, error } = await supabase
      .from('profiles')
      .select('mentorship_prompt_seen')
      .eq('id', userId)
      .single();
    if (error) return { seen: true, error };
    return { seen: Boolean(data?.mentorship_prompt_seen), error: null };
  },

  markPromptSeen: async (userId: string): Promise<{ error: Error | null }> => {
    const { error } = await supabase
      .from('profiles')
      .update({ mentorship_prompt_seen: true })
      .eq('id', userId);
    return { error: error ?? null };
  },
};
