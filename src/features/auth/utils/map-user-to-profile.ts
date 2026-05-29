import type { User } from '@supabase/supabase-js';

import {
  getOAuthAvatarUrl,
  getOAuthDisplayName,
} from '@/features/auth/utils/oauth-profile-metadata';
import type { UserProfile, UserRole } from '@/types/domain';

export function mapUserToProfile(user: User): UserProfile {
  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const role = (meta.role as UserRole | undefined) ?? 'member';

  const isAdmin = role === 'admin' || Boolean(meta.is_admin);

  return {
    id: user.id,
    email: user.email ?? '',
    displayName: getOAuthDisplayName(meta),
    avatarUrl: getOAuthAvatarUrl(meta),
    role: isAdmin ? 'admin' : role,
    isAdmin,
    isSuperAdmin: role === 'super_admin' || Boolean(meta.is_super_admin),
    onboardingComplete: meta.onboarding_complete === true,
  };
}
