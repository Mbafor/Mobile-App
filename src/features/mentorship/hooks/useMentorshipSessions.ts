import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { isSessionUpcoming } from '@/features/mentorship/utils/format-session';
import { mentorshipDataApi } from '@/services/api';
import type { MentorshipSession, MentorshipSessionStatus } from '@/types/domain/mentorship';

export function useMentorshipSessions(userId: string | undefined) {
  const queryClient = useQueryClient();

  const sessionsQuery = useQuery({
    queryKey: queryKeys.mentorship.sessions(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [];
      const result = await mentorshipDataApi.listSessionsForUser(userId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(userId),
    refetchInterval: 60_000,
  });

  const sessions = sessionsQuery.data ?? [];
  const upcoming = sessions.filter(isSessionUpcoming);
  const completed = sessions.filter((s) => s.status === 'completed');
  const past = sessions.filter(
    (s) => s.status === 'cancelled' || (!isSessionUpcoming(s) && s.status !== 'completed'),
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.mentorship.sessions(userId ?? '') });
  };

  return {
    sessions,
    upcoming,
    completed,
    past,
    isLoading: sessionsQuery.isLoading,
    error: sessionsQuery.error,
    refetch: sessionsQuery.refetch,
    invalidate,
  };
}

export function useSessionMutations(userId: string | undefined) {
  const queryClient = useQueryClient();

  const bookMutation = useMutation({
    mutationFn: mentorshipDataApi.bookSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorship.sessions(userId ?? '') });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({
      sessionId,
      updates,
    }: {
      sessionId: string;
      updates: Parameters<typeof mentorshipDataApi.updateSession>[1];
    }) => mentorshipDataApi.updateSession(sessionId, updates),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorship.sessions(userId ?? '') });
    },
  });

  const book = async (input: Parameters<typeof mentorshipDataApi.bookSession>[0]) => {
    const result = await bookMutation.mutateAsync(input);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  };

  const update = async (
    sessionId: string,
    updates: Parameters<typeof mentorshipDataApi.updateSession>[1],
  ) => {
    const result = await updateMutation.mutateAsync({ sessionId, updates });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  };

  return { book, update, isBooking: bookMutation.isPending, isUpdating: updateMutation.isPending };
}

export function filterSessionsForMentorship(
  sessions: MentorshipSession[],
  mentorshipId: string,
): MentorshipSession[] {
  return sessions.filter((s) => s.mentorshipId === mentorshipId);
}
