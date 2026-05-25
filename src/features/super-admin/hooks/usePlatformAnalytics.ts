import { useAuth } from '@/features/auth/hooks/useAuth';
import { usePlatformAnalyticsQuery } from '@/hooks/use-platform-analytics';

/** Super Admin opportunities tab — no redirect. */
export function useSuperAdminAnalytics() {
  const { isSuperAdmin, isAuthReady } = useAuth();
  return usePlatformAnalyticsQuery(isAuthReady && isSuperAdmin);
}
