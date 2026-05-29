import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { opportunitiesApi } from '@/services/api';

/** Shared cache of all active opportunities (home, search, dashboard). */
export function useActiveOpportunities() {
  return useQuery({
    queryKey: queryKeys.opportunities.all,
    queryFn: async () => {
      const { data, error } = await opportunitiesApi.listActive();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
