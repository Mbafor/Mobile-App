import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { adminApi } from '@/services/api';

export function useAdminAnalytics() {
  const { isReady } = useRequireAdmin();

  return useQuery({
    queryKey: queryKeys.admin.analytics,
    queryFn: async () => {
      const { data, error } = await adminApi.getAnalytics();
      if (error) throw error;
      if (!data) throw new Error('Failed to load admin analytics');
      return data;
    },
    enabled: isReady,
  });
}
