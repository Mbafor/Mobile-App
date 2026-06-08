import type { AuthChangeEvent, Session, User } from '@supabase/supabase-js';
import type { PropsWithChildren } from 'react';
import { useEffect, useRef } from 'react';

import { useAuthStore } from '@/features/auth/store/auth.store';
import { clearSupabaseAuthStorage } from '@/features/auth/utils/clear-auth-storage';
import { resolveUserProfile } from '@/features/auth/utils/resolve-user-profile';
import { authApi } from '@/services/api';

function sessionFingerprint(session: Session | null): string | null {
  if (!session) return null;
  return `${session.user.id}:${session.access_token}`;
}

export function AuthProvider({ children }: PropsWithChildren) {
  const setHydrating = useAuthStore((s) => s.setHydrating);
  const setProfileLoading = useAuthStore((s) => s.setProfileLoading);
  const setSession = useAuthStore((s) => s.setSession);
  const setProfile = useAuthStore((s) => s.setProfile);
  const profileRequestId = useRef(0);
  const lastFingerprint = useRef<string | null>(null);
  const hydrateDone = useRef(false);

  useEffect(() => {
    let mounted = true;

    const loadProfile = async (user: User) => {
      const requestId = ++profileRequestId.current;
      setProfileLoading(true);
      try {
        const profile = await resolveUserProfile(user);
        if (mounted && requestId === profileRequestId.current) {
          setProfile(profile);
        }
      } finally {
        if (mounted && requestId === profileRequestId.current) {
          setProfileLoading(false);
        }
      }
    };

    const applySession = async (session: Session | null, event?: AuthChangeEvent) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT') {
        lastFingerprint.current = null;
        await clearSupabaseAuthStorage();
        useAuthStore.getState().reset();
      }

      const fingerprint = sessionFingerprint(session);
      // USER_UPDATED fires when auth.updateUser() is called (e.g. after onboarding
      // marks onboarding_complete). We must bypass the fingerprint dedup so the
      // profile is re-fetched and onboardingComplete reflects the new state.
      const isUserUpdated = event === 'USER_UPDATED';
      if (fingerprint === lastFingerprint.current && event !== 'SIGNED_OUT' && !isUserUpdated) {
        return;
      }
      lastFingerprint.current = fingerprint;

      setSession(session);

      if (session?.user) {
        await loadProfile(session.user);
      } else {
        profileRequestId.current += 1;
        setProfile(null);
        setProfileLoading(false);
      }
    };

    const hydrate = async () => {
      setHydrating(true);
      try {
        const { data, error } = await authApi.getSession();
        if (error) {
          console.warn('[AuthProvider] getSession:', error.message);
        }
        await applySession(data.session);
      } catch (e) {
        console.warn('[AuthProvider] hydrate failed:', e);
        if (mounted) {
          lastFingerprint.current = null;
          setSession(null);
          setProfile(null);
          setProfileLoading(false);
        }
      } finally {
        if (mounted) {
          hydrateDone.current = true;
          setHydrating(false);
        }
      }
    };

    void hydrate();

    const { data: subscription } = authApi.onAuthStateChange((event, session) => {
      if (event === 'INITIAL_SESSION' && hydrateDone.current) {
        return;
      }
      void applySession(session, event as AuthChangeEvent);
    });

    return () => {
      mounted = false;
      subscription.subscription.unsubscribe();
    };
  }, [setHydrating, setProfile, setProfileLoading, setSession]);

  return children;
}
