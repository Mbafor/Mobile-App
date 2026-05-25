import { useAuthStore } from '@/features/auth/store/auth.store';

export function useAuth() {
  const session = useAuthStore((s) => s.session);
  const profile = useAuthStore((s) => s.profile);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const isHydrating = useAuthStore((s) => s.isHydrating);
  const isProfileLoading = useAuthStore((s) => s.isProfileLoading);

  /** Ready to route: hydrated and profile resolved when signed in. */
  const isAuthReady = !isHydrating && (!isAuthenticated || !isProfileLoading);

  const userEmail = profile?.email || session?.user?.email || '';

  return {
    session,
    profile,
    user: session?.user ?? null,
    userEmail,
    isAuthenticated,
    isHydrating,
    isProfileLoading,
    isAuthReady,
    onboardingComplete: profile?.onboardingComplete ?? false,
    isAdmin: profile?.isAdmin ?? false,
    isSuperAdmin: profile?.isSuperAdmin ?? false,
  };
}
