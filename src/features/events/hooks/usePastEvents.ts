import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { eventsApi } from '@/services/api';

export function usePastEvents(enabled: boolean) {
  return useQuery({
    queryKey: queryKeys.events.past,
    queryFn: async () => {
      const { data, error } = await eventsApi.listPast();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
    enabled,
  });
}
