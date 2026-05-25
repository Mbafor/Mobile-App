import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { usePlatformAnalyticsQuery } from '@/hooks/use-platform-analytics';

/** Opportunity admin dashboard analytics (redirects non-admins). */
export function useAdminAnalytics() {
  const { isReady } = useRequireAdmin();
  return usePlatformAnalyticsQuery(isReady);
}
