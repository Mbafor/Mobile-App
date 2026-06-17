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

  syncEmailFromAuth: async (email: string, userId?: string) => {
    const id = userId ?? (await supabase.auth.getUser()).data.user?.id;
    if (!id || !email.trim()) return { error: new Error('Missing user or email') };

    const { error } = await supabase
      .from('profiles')
      .update({ email: email.trim().toLowerCase() })
      .eq('id', id);

    return { error };
  },

  ensureProfile: async (userId: string, email: string | undefined) => {
    if (!email?.trim()) {
      return {
        data: null,
        error: new Error('Email is required. Use a valid email address to sign in.'),
      };
    }

    const existing = await profilesApi.getByUserId(userId);
    if (existing.data) {
      if (email && existing.data.email !== email) {
        const { data, error } = await supabase
          .from('profiles')
          .update({ email })
          .eq('id', userId)
          .select('*')
          .single();
        return { data: data ? mapProfileRow(data) : existing.data, error };
      }
      return existing;
    }

    const { data, error } = await supabase
      .from('profiles')
      .insert({
        id: userId,
        email: email.trim().toLowerCase(),
        onboarding_complete: false,
      })
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

  markOnboardingIncomplete: async (userId: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ onboarding_complete: false })
      .eq('id', userId)
      .select('*')
      .single();

    if (!error) {
      await supabase.auth.updateUser({
        data: { onboarding_complete: false },
      });
    }

    return { data: data ? mapProfileRow(data) : null, error };
  },

  updateAvatarUrl: async (userId: string, avatarUrl: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ avatar_url: avatarUrl })
      .eq('id', userId)
      .select('*')
      .single();

    return { data: data ? mapProfileRow(data) : null, error };
  },

  updateFullName: async (userId: string, fullName: string) => {
    const { data, error } = await supabase
      .from('profiles')
      .update({ full_name: fullName.trim() })
      .eq('id', userId)
      .select('*')
      .single();

    return { data: data ? mapProfileRow(data) : null, error };
  },

  markWelcomeEmailSent: async (userId: string) => {
    const { error } = await supabase
      .from('profiles')
      .update({ welcome_email_sent_at: new Date().toISOString() })
      .eq('id', userId);

    return { error };
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

  saveBio: async (userId: string, bio: string) => {
    const trimmed = bio.trim();
    const { data, error } = await supabase
      .from('profiles')
      .update({ bio: trimmed.length > 0 ? trimmed : null })
      .eq('id', userId)
      .select('*')
      .single();

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
