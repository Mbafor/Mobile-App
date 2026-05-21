import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { useRequireAdmin } from '@/features/admin/hooks/useRequireAdmin';
import { adminApi } from '@/services/api';

export function useAdminStats() {
  const { isReady } = useRequireAdmin();

  return useQuery({
    queryKey: queryKeys.admin.stats,
    queryFn: async () => {
      const { data, error } = await adminApi.getDashboardStats();
      if (error) throw error;
      if (!data) throw new Error('Failed to load admin stats');
      return data;
    },
    enabled: isReady,
  });
}
