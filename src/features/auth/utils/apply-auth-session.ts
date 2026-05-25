import type { Session } from '@supabase/supabase-js';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { resolveUserProfile } from '@/features/auth/utils/resolve-user-profile';

/**
 * Writes Supabase session + profile into the auth store so routing works immediately
 * (does not rely solely on AuthProvider's onAuthStateChange timing).
 */
export async function applyAuthSession(session: Session): Promise<void> {
  const store = useAuthStore.getState();
  store.setSession(session);
  store.setProfileLoading(true);

  try {
    const profile = await resolveUserProfile(session.user);
    store.setProfile(profile);
  } finally {
    store.setProfileLoading(false);
  }
}
