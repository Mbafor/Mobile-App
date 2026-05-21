import type { User } from '@supabase/supabase-js';

import { mapUserToProfile } from '@/features/auth/utils/map-user-to-profile';
import { syncOAuthProfileIfNeeded } from '@/features/auth/utils/sync-oauth-profile';
import { mapToUserProfile } from '@/services/api/mappers/profile.mapper';
import { profilesApi } from '@/services/api';

export async function resolveUserProfile(user: User) {
  await syncOAuthProfileIfNeeded(user);

  const { data: profile, error } = await profilesApi.getByUserId(user.id);

  if (!error && profile) {
    return mapToUserProfile(profile, user.email ?? '');
  }

  await profilesApi.ensureProfile(user.id, user.email ?? undefined);
  const retry = await profilesApi.getByUserId(user.id);
  if (retry.data) {
    return mapToUserProfile(retry.data, user.email ?? '');
  }

  const fallback = mapUserToProfile(user);
  return { ...fallback, onboardingComplete: false };
}
