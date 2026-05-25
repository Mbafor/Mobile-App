import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { adminApi } from '@/services/api';

export function usePlatformAnalyticsQuery(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.admin.analytics,
    queryFn: async () => {
      const { data, error } = await adminApi.getAnalytics();
      if (error) throw error;
      if (!data) throw new Error('Failed to load analytics');
      return data;
    },
    enabled,
  });
}
