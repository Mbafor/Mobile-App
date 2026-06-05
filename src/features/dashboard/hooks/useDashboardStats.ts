import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/constants/query-keys';
import { appliedOpportunitiesApi, savedOpportunitiesApi } from '@/services/api';
import { supabase } from '@/services/supabase/client';

export function useDashboardStats() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const savedQuery = useQuery({
    queryKey: [...queryKeys.opportunities.saved(userId), 'count'] as const,
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await savedOpportunitiesApi.countByUser(userId);
      if (error) throw error;
      return count;
    },
    enabled: Boolean(userId),
  });

  const appliedQuery = useQuery({
    queryKey: ['opportunities', 'applied-count', userId] as const,
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await appliedOpportunitiesApi.countByUser(userId);
      if (error) throw error;
      return count;
    },
    enabled: Boolean(userId),
  });

  const mentorsQuery = useQuery({
    queryKey: ['mentors', 'all-approved-count'] as const,
    queryFn: async () => {
      const { count, error } = await supabase
        .from('mentor_profiles')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'approved');
      if (error) throw error;
      return count ?? 0;
    },
  });

  return {
    savedCount: savedQuery.data ?? 0,
    appliedCount: appliedQuery.data ?? 0,
    mentorsCount: mentorsQuery.data ?? 0,
    isLoading: savedQuery.isLoading || appliedQuery.isLoading || mentorsQuery.isLoading,
    isRefetching: savedQuery.isRefetching || appliedQuery.isRefetching || mentorsQuery.isRefetching,
    refetch: async () => {
      await Promise.all([savedQuery.refetch(), appliedQuery.refetch(), mentorsQuery.refetch()]);
    },
  };
}
