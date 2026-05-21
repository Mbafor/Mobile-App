import type { OnboardingAcademicInfo, OnboardingBasicInfo } from '@/types/domain/onboarding';
import { mapProfileRow } from '@/services/api/mappers/profile.mapper';
import { supabase } from '@/services/supabase/client';

export const profilesApi = {
  getByUserId: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    return { data: data ? mapProfileRow(data) : null, error };
  },

  ensureProfile: async (userId: string, email: string | undefined) => {
    const existing = await profilesApi.getByUserId(userId);
    if (existing.data) return existing;

    const { data, error } = await supabase
      .from('profiles')
      .insert({ id: userId, email: email ?? null, onboarding_complete: false })
      .select('*')
      .single();

    return { data: data ? mapProfileRow(data) : null, error };
  },

  saveBasicInfo: async (userId: string, email: string | undefined, info: OnboardingBasicInfo) => {
    await profilesApi.ensureProfile(userId, email);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        email: email ?? null,
        full_name: info.fullName.trim(),
        country: info.country.trim(),
      })
      .eq('id', userId)
      .select('*')
      .single();

    return { data: data ? mapProfileRow(data) : null, error };
  },

  saveAcademicInfo: async (userId: string, info: OnboardingAcademicInfo) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        university: info.university.trim(),
        degree_level: info.degreeLevel,
        course_major: info.courseMajor.trim(),
        interests: info.interests,
        career_interests: info.careerInterests,
      })
      .eq('id', userId)
      .select('*')
      .single();

    return { data: data ? mapProfileRow(data) : null, error };
  },

  markOnboardingComplete: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ onboarding_complete: true })
      .eq('id', userId)
      .select('*')
      .single();

    if (!error) {
      await supabase.auth.updateUser({
        data: { onboarding_complete: true },
      });
    }

    return { data: data ? mapProfileRow(data) : null, error };
  },

  saveFullProfile: async (
    userId: string,
    email: string | undefined,
    payload: OnboardingBasicInfo &
      OnboardingAcademicInfo & { onboardingComplete?: boolean },
  ) => {
    await profilesApi.ensureProfile(userId, email);

    const { data, error } = await supabase
      .from('profiles')
      .update({
        email: email ?? null,
        full_name: payload.fullName.trim(),
        country: payload.country.trim(),
        university: payload.university.trim(),
        degree_level: payload.degreeLevel,
        course_major: payload.courseMajor.trim(),
        interests: payload.interests,
        career_interests: payload.careerInterests,
        ...(payload.onboardingComplete !== undefined && {
          onboarding_complete: payload.onboardingComplete,
        }),
      })
      .eq('id', userId)
      .select('*')
      .single();

    return { data: data ? mapProfileRow(data) : null, error };
  },
};
