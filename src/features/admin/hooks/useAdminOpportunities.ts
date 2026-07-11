import { useInfiniteQuery, useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/constants/query-keys';
import { useCanManageOpportunities } from '@/features/admin/hooks/useCanManageOpportunities';
import { adminApi } from '@/services/api';

const PENDING_PAGE_SIZE = 25;

export function usePendingOpportunities() {
  const { isReady } = useCanManageOpportunities();

  return useInfiniteQuery({
    queryKey: queryKeys.admin.pendingOpportunities,
    queryFn: async ({ pageParam }) => {
      const { data, error, hasMore } = await adminApi.listPending(pageParam, PENDING_PAGE_SIZE);
      if (error) throw error;
      return { items: data ?? [], hasMore };
    },
    initialPageParam: 0,
    getNextPageParam: (lastPage, _allPages, lastPageParam) =>
      lastPage.hasMore ? (lastPageParam as number) + 1 : undefined,
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
  const { t } = useTranslation();

  return useQuery({
    queryKey: queryKeys.admin.opportunity(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error(t('admin.errors.missingOpportunityId'));
      const { data, error } = await adminApi.getOpportunity(id);
      if (error) throw error;
      if (!data) throw new Error(t('admin.errors.opportunityNotFound'));
      return data;
    },
    enabled: isReady && Boolean(id),
  });
}
