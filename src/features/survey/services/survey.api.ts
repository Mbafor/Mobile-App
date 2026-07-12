import { supabase } from '@/services/supabase/client';
import type { SurveyAnswers } from '@/features/survey/types/survey.types';

// `feature_survey_responses` and `profiles.feature_survey_completed` are not
// yet in the generated Database types — same cast used by useHelpSubmissions.ts
// for other untyped feedback tables until types are regenerated.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const db = supabase as any;

export const surveyApi = {
  /** Whether this user has already completed the survey (null user → treated as not eligible). */
  getCompletionStatus: async (userId: string): Promise<{ completed: boolean; error: Error | null }> => {
    const { data, error } = await db
      .from('profiles')
      .select('feature_survey_completed')
      .eq('id', userId)
      .single();
    if (error) return { completed: true, error };
    return { completed: Boolean(data?.feature_survey_completed), error: null };
  },

  submitResponse: async (userId: string, answers: SurveyAnswers): Promise<{ error: Error | null }> => {
    const { error } = await db.from('feature_survey_responses').insert({
      user_id: userId,
      experience_rating: answers.experienceRating,
      most_used_feature: answers.mostUsedFeature,
      excited_about: answers.excitedAbout,
      feature_request: answers.featureRequest,
    });
    if (error) return { error };

    const { error: profileError } = await db
      .from('profiles')
      .update({ feature_survey_completed: true })
      .eq('id', userId);
    return { error: profileError ?? null };
  },
};
