import type { User } from '@supabase/supabase-js';

import {
  getOAuthAvatarUrl,
  getOAuthDisplayName,
} from '@/features/auth/utils/oauth-profile-metadata';
import { profilesApi } from '@/services/api';

/** Persist Google/Apple photo and name into `profiles` when the row is still empty. */
export async function syncOAuthProfileIfNeeded(user: User): Promise<void> {
  await profilesApi.ensureProfile(user.id, user.email ?? undefined);

  const { data: profile } = await profilesApi.getByUserId(user.id);
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;

  const oauthAvatar = getOAuthAvatarUrl(meta);
  if (oauthAvatar && !profile?.avatarUrl) {
    await profilesApi.updateAvatarUrl(user.id, oauthAvatar);
  }

  const oauthName = getOAuthDisplayName(meta);
  if (oauthName && !profile?.fullName?.trim()) {
    await profilesApi.updateFullName(user.id, oauthName);
  }
}
