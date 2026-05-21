import type { OnboardingOpportunityPrefs } from '@/types/domain/onboarding';
import { mapPreferencesRow } from '@/services/api/mappers/profile.mapper';
import { supabase } from '@/services/supabase/client';

export const userPreferencesApi = {
  getByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('user_preferences')
      .select('*')
      .eq('user_id', userId)
      .maybeSingle();

    return { data: data ? mapPreferencesRow(data) : null, error };
  },

  ensurePreferences: async (userId: string) => {
    const existing = await userPreferencesApi.getByUserId(userId);
    if (existing.data) return existing;

    const { data, error } = await supabase
      .from('user_preferences')
      .insert({ user_id: userId })
      .select('*')
      .single();

    return { data: data ? mapPreferencesRow(data) : null, error };
  },

  saveOpportunityPreferences: async (userId: string, prefs: OnboardingOpportunityPrefs) => {
    await userPreferencesApi.ensurePreferences(userId);

    const { data, error } = await supabase
      .from('user_preferences')
      .update({
        opportunity_types: prefs.opportunityTypes,
        preferred_countries: prefs.preferredCountries,
        funding_preference: prefs.fundingPreference,
      })
      .eq('user_id', userId)
      .select('*')
      .single();

    return { data: data ? mapPreferencesRow(data) : null, error };
  },

  saveFullPreferences: async (userId: string, prefs: OnboardingOpportunityPrefs) => {
    return userPreferencesApi.saveOpportunityPreferences(userId, prefs);
  },
};
