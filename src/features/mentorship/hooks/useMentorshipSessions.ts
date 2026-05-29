import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { isSessionUpcoming } from '@/features/mentorship/utils/format-session';
import { mentorshipDataApi, mentorshipSchedulingApi } from '@/services/api';
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

  useEffect(() => {
    if (userId) void mentorshipSchedulingApi.completePastSessions();
  }, [userId]);

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
    mutationFn: mentorshipSchedulingApi.bookSession,
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorship.sessions(userId ?? '') });
      if (result.success && result.data.coachId) {
        queryClient.invalidateQueries({
          queryKey: queryKeys.mentorship.sessions(result.data.coachId),
        });
        queryClient.invalidateQueries({
          queryKey: queryKeys.mentorship.availabilitySlots(result.data.coachId),
        });
      }
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

  const confirmMutation = useMutation({
    mutationFn: ({
      sessionId,
      meetingUrl,
    }: {
      sessionId: string;
      meetingUrl?: string | null;
    }) => mentorshipSchedulingApi.confirmSession(sessionId, meetingUrl),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorship.sessions(userId ?? '') });
    },
  });

  const book = async (input: Parameters<typeof mentorshipSchedulingApi.bookSession>[0]) => {
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

  const confirm = async (sessionId: string, meetingUrl?: string | null) => {
    const result = await confirmMutation.mutateAsync({ sessionId, meetingUrl });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  };

  const cancelMutation = useMutation({
    mutationFn: ({
      sessionId,
      reason,
    }: {
      sessionId: string;
      reason?: string;
    }) => mentorshipSchedulingApi.cancelSession(sessionId, reason),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.mentorship.sessions(userId ?? '') });
    },
  });

  const cancel = async (sessionId: string, reason?: string) => {
    const result = await cancelMutation.mutateAsync({ sessionId, reason });
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  };

  return {
    book,
    update,
    confirm,
    cancel,
    isBooking: bookMutation.isPending,
    isUpdating: updateMutation.isPending,
    isConfirming: confirmMutation.isPending,
    isCancelling: cancelMutation.isPending,
  };
}

export function filterSessionsForMentorship(
  sessions: MentorshipSession[],
  mentorshipId: string,
): MentorshipSession[] {
  return sessions.filter((s) => s.mentorshipId === mentorshipId);
}
