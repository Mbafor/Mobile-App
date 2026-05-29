import { useQuery } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { mentorshipApi, mentorshipDataApi } from '@/services/api';

export function useStudentMentorship() {
  const { user } = useAuth();
  const userId = user?.id ?? '';

  const activeQuery = useQuery({
    queryKey: queryKeys.mentorship.active(userId),
    queryFn: async () => {
      const result = await mentorshipApi.getActiveMentorship(userId, 'student');
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(userId),
  });

  const openRequestQuery = useQuery({
    queryKey: queryKeys.mentorship.openRequest(userId),
    queryFn: async () => {
      const result = await mentorshipApi.getOpenRequest(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(userId),
  });

  const waitingQuery = useQuery({
    queryKey: queryKeys.mentorship.waiting(userId),
    queryFn: async () => {
      const result = await mentorshipDataApi.getWaitingListStatus(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(userId) && openRequestQuery.data?.status === 'waiting_list',
  });

  const coachProfileQuery = useQuery({
    queryKey: queryKeys.mentorship.coachProfile(activeQuery.data?.mentorId ?? ''),
    queryFn: async () => {
      const mentorId = activeQuery.data?.mentorId;
      if (!mentorId) return null;
      const [mentor, profile] = await Promise.all([
        mentorshipDataApi.getMentorProfile(mentorId),
        mentorshipDataApi.getParticipantProfile(mentorId),
      ]);
      if (!mentor.success) throw new Error(mentor.error.message);
      if (!profile.success) throw new Error(profile.error.message);
      return { mentor: mentor.data, profile: profile.data };
    },
    enabled: Boolean(activeQuery.data?.mentorId),
  });

  return {
    activeMentorship: activeQuery.data ?? null,
    openRequest: openRequestQuery.data ?? null,
    waitingList: waitingQuery.data ?? null,
    coach: coachProfileQuery.data,
    isLoading:
      activeQuery.isLoading || openRequestQuery.isLoading || coachProfileQuery.isLoading,
    error: activeQuery.error ?? openRequestQuery.error ?? coachProfileQuery.error,
    refetch: async () => {
      await Promise.all([
        activeQuery.refetch(),
        openRequestQuery.refetch(),
        waitingQuery.refetch(),
        coachProfileQuery.refetch(),
      ]);
    },
  };
}
