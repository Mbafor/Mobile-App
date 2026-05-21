import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { opportunitiesApi } from '@/services/api';

export function useOpportunityDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.opportunities.detail(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await opportunitiesApi.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });
}
