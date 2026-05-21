import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/constants/query-keys';
import { savedOpportunitiesApi } from '@/services/api';

export function useSavedOpportunityIds() {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: queryKeys.opportunities.saved(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [] as string[];
      const { data, error } = await savedOpportunitiesApi.listOpportunityIds(userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
  });
}
