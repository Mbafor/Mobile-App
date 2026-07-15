import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { eventsApi } from '@/services/api';

export function useEventDetail(id: string | undefined) {
  return useQuery({
    queryKey: queryKeys.events.detail(id ?? ''),
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await eventsApi.getById(id);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(id),
  });
}
