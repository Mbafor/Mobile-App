import { useMemo } from 'react';

import { useDashboardStats } from '@/features/dashboard/hooks/useDashboardStats';
import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
import {
  buildClosingSoon,
  buildRecentlyUploaded,
  buildRecommendedForYou,
} from '@/features/opportunities/utils/home-sections';

export function useDashboard() {
  const { profile, preferences } = useProfileData();
  const opportunitiesQuery = useActiveOpportunities();
  const stats = useDashboardStats();

  const sections = useMemo(() => {
    const all = opportunitiesQuery.data ?? [];
    const interests = profile?.interests ?? [];
    const opportunityTypes = preferences?.opportunityTypes ?? [];

    return {
      recommended: buildRecommendedForYou(all, interests, opportunityTypes),
      recent: buildRecentlyUploaded(all),
      closingSoon: buildClosingSoon(all),
    };
  }, [opportunitiesQuery.data, preferences?.opportunityTypes, profile?.interests]);

  const refetchAll = async () => {
    await Promise.all([opportunitiesQuery.refetch(), stats.refetch()]);
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
