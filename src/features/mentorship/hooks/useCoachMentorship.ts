import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { mentorshipApi, mentorshipDataApi } from '@/services/api';

export function useCoachMentorship() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const menteesQuery = useQuery({
    queryKey: queryKeys.mentorship.mentees(userId),
    queryFn: async () => {
      const result = await mentorshipDataApi.listActiveMentees(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(userId),
  });

  const capacityQuery = useQuery({
    queryKey: queryKeys.mentorship.mentorCapacity(userId),
    queryFn: async () => {
      const result = await mentorshipApi.getMentorCapacity(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(userId),
  });

  const mentorProfileQuery = useQuery({
    queryKey: queryKeys.mentorship.myMentorProfile(userId),
    queryFn: async () => {
      const result = await mentorshipDataApi.getMentorProfile(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(userId),
  });

  return {
    mentees: menteesQuery.data ?? [],
    capacity: capacityQuery.data,
    mentorProfile: mentorProfileQuery.data,
    isLoading: menteesQuery.isLoading || capacityQuery.isLoading,
    error: menteesQuery.error ?? capacityQuery.error,
    refetch: async () => {
      await Promise.all([
        menteesQuery.refetch(),
        capacityQuery.refetch(),
        mentorProfileQuery.refetch(),
      ]);
    },
  };
}
