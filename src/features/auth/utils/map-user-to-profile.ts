import type { User } from '@supabase/supabase-js';

import type { UserProfile, UserRole } from '@/types/domain';

export function mapUserToProfile(user: User): UserProfile {
  const meta = user.user_metadata ?? {};
  const role = (meta.role as UserRole | undefined) ?? 'member';

  const isAdmin = role === 'admin' || Boolean(meta.is_admin);

  return {
    id: user.id,
    email: user.email ?? '',
    displayName: (meta.display_name as string | undefined) ?? (meta.full_name as string | undefined) ?? null,
    avatarUrl: (meta.avatar_url as string | undefined) ?? null,
    role: isAdmin ? 'admin' : role,
    isAdmin,
    onboardingComplete: meta.onboarding_complete === true,
  };
}
