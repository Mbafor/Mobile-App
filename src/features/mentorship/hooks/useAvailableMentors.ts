import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { mentorshipDataApi } from '@/services/api';

type UseAvailableMentorsOptions = {
  enabled?: boolean;
};

export function useAvailableMentors({ enabled = true }: UseAvailableMentorsOptions = {}) {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  return useQuery({
    queryKey: ['mentorship', 'availableMentors', userId],
    queryFn: async () => {
      const res = await mentorshipDataApi.listAvailableMentors();
      if (!res.success) throw new Error(res.error.message);
      return res.data ?? [];
    },
    enabled: enabled && Boolean(userId),
    staleTime: 30_000,
  });
}
