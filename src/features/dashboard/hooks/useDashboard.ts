import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';

import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
import {
  buildClosingSoon,
  buildFullyFunded,
  buildRecentlyUploaded,
  buildRecommendedForYou,
  buildTrending,
  buildTrendingFallback,
} from '@/features/opportunities/utils/home-sections';
import { queryKeys } from '@/constants/query-keys';
import { opportunitiesApi } from '@/services/api';

export function useDashboard() {
  const { profile, preferences } = useProfileData();
  const opportunitiesQuery = useActiveOpportunities();
  const stats = useDashboardStats();

  const trendingQuery = useQuery({
    queryKey: queryKeys.opportunities.trending,
    queryFn: async () => {
      const { data, error } = await opportunitiesApi.getTrendingIds();
      if (error) throw error;
      return data ?? [];
    },
    staleTime: 5 * 60 * 1000,
  });

  const sections = useMemo(() => {
    const all = opportunitiesQuery.data ?? [];
    const interests = profile?.interests ?? [];
    const opportunityTypes = preferences?.opportunityTypes ?? [];
    const trendingIds = trendingQuery.data ?? [];
    const trending = buildTrending(all, trendingIds);

    return {
      recommended: buildRecommendedForYou(all, interests, opportunityTypes),
      recent: buildRecentlyUploaded(all),
      closingSoon: buildClosingSoon(all),
      trending: trending.length > 0 ? trending : buildTrendingFallback(all),
      fullyFunded: buildFullyFunded(all),
    };
  }, [opportunitiesQuery.data, preferences?.opportunityTypes, profile?.interests, trendingQuery.data]);

  const refetchAll = async () => {
    await Promise.all([opportunitiesQuery.refetch(), stats.refetch(), trendingQuery.refetch()]);
  };

  return {
    ...sections,
    totalOpportunities: opportunitiesQuery.data?.length ?? 0,
    savedCount: stats.savedCount,
    appliedCount: stats.appliedCount,
    mentorsCount: stats.mentorsCount,
    menteeCount: stats.menteeCount,
    isApprovedMentor: stats.isApprovedMentor,
    isLoading: opportunitiesQuery.isLoading || stats.isLoading,
    isRefetching: opportunitiesQuery.isRefetching || stats.isRefetching,
    error: opportunitiesQuery.error,
    refetch: refetchAll,
  };
}
