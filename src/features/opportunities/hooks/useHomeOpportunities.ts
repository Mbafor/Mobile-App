import { useMemo } from 'react';

import { useProfileData } from '@/features/onboarding/hooks/useProfileData';
import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
import {
  buildClosingSoon,
  buildRecentlyUploaded,
  buildRecommendedForYou,
} from '@/features/opportunities/utils/home-sections';

/** @deprecated Use useDashboard from dashboard feature */
export function useHomeOpportunities() {
  const { profile, preferences } = useProfileData();
  const query = useActiveOpportunities();

  const sections = useMemo(() => {
    const all = query.data ?? [];
    const interests = profile?.interests ?? [];
    const opportunityTypes = preferences?.opportunityTypes ?? [];

    return {
      recommended: buildRecommendedForYou(all, interests, opportunityTypes),
      recent: buildRecentlyUploaded(all),
      closingSoon: buildClosingSoon(all),
    };
  }, [preferences?.opportunityTypes, profile?.interests, query.data]);

  return {
    ...sections,
    isLoading: query.isLoading,
    isRefetching: query.isRefetching,
    error: query.error,
    refetch: query.refetch,
  };
}
