import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { mentorshipDataApi } from '@/services/api';

export type MentorshipRole = 'student' | 'coach';

export function useMentorshipRole() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const query = useQuery({
    queryKey: queryKeys.mentorship.role(userId),
    queryFn: async (): Promise<MentorshipRole> => {
      if (!userId) return 'student';
      const result = await mentorshipDataApi.getApprovedMentorProfile(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data ? 'coach' : 'student';
    },
    enabled: Boolean(userId),
    staleTime: 60_000,
  });

  return {
    role: query.data ?? 'student',
    isCoach: query.data === 'coach',
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
  };
}
