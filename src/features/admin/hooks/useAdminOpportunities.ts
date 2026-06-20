import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { useCanManageOpportunities } from '@/features/admin/hooks/useCanManageOpportunities';
import { adminApi } from '@/services/api';

export function usePendingOpportunities() {
  const { isReady } = useCanManageOpportunities();

  return useQuery({
    queryKey: queryKeys.admin.pendingOpportunities,
    queryFn: async () => {
      const { data, error } = await adminApi.listPending();
      if (error) throw error;
      return data ?? [];
    },
    enabled: isReady,
  });
}

export function useAdminOpportunities() {
  const { isReady } = useCanManageOpportunities();

  return useQuery({
    queryKey: queryKeys.admin.opportunities,
    queryFn: async () => {
      const { data, error } = await adminApi.listOpportunities();
      if (error) throw error;
      return data ?? [];
    },
    enabled: isReady,
  });
}

export function useAdminOpportunity(id: string | undefined) {
  const { isReady } = useCanManageOpportunities();

  return useQuery({
    queryKey: queryKeys.admin.opportunity(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error('Missing opportunity id');
      const { data, error } = await adminApi.getOpportunity(id);
      if (error) throw error;
      if (!data) throw new Error('Opportunity not found');
      return data;
    },
    enabled: isReady && Boolean(id),
  });
}
