import { useCallback } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { resolveUserProfile } from '@/features/auth/utils/resolve-user-profile';

export function useRefreshProfile() {
  const session = useAuthStore((s) => s.session);
  const setProfile = useAuthStore((s) => s.setProfile);
  const setProfileLoading = useAuthStore((s) => s.setProfileLoading);

  return useCallback(async () => {
    const user = session?.user;
    if (!user) return;

    setProfileLoading(true);
    try {
      const profile = await resolveUserProfile(user);
      setProfile(profile);
    } finally {
      setProfileLoading(false);
    }
  }, [session?.user, setProfile, setProfileLoading]);
}
