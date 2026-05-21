import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { savedOpportunitiesApi } from '@/services/api';
import type { Opportunity } from '@/types/domain/opportunity';

export function useSavedOpportunities() {
  const { user } = useAuth();
  const userId = user?.id;

  const savedMetaQuery = useQuery({
    queryKey: [...queryKeys.opportunities.saved(userId ?? ''), 'list'] as const,
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await savedOpportunitiesApi.listSaved(userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
  });

  const activeQuery = useActiveOpportunities();

  const opportunities = useMemo(() => {
    const savedRows = savedMetaQuery.data ?? [];
    if (savedRows.length === 0) return [];

    const byId = new Map((activeQuery.data ?? []).map((o) => [o.id, o]));
    return savedRows
      .map((row) => byId.get(row.opportunityId))
      .filter((o): o is Opportunity => Boolean(o));
  }, [savedMetaQuery.data, activeQuery.data]);

  return {
    opportunities,
    isLoading: savedMetaQuery.isLoading || activeQuery.isLoading,
    isRefetching: savedMetaQuery.isRefetching || activeQuery.isRefetching,
    error: savedMetaQuery.error ?? activeQuery.error,
    refetch: async () => {
      await Promise.all([savedMetaQuery.refetch(), activeQuery.refetch()]);
    },
  };
}
