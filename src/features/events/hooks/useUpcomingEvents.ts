import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { eventsApi } from '@/services/api';

/** Shared cache of all upcoming events. */
export function useUpcomingEvents() {
  return useQuery({
    queryKey: queryKeys.events.upcoming,
    queryFn: async () => {
      const { data, error } = await eventsApi.listUpcoming();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });
}
