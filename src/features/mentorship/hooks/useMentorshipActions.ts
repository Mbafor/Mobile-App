import { useMutation, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';

import { queryKeys } from '@/constants/query-keys';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { mentorshipApi } from '@/services/api';

export function useMentorshipActions() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['mentorship'] });
  };

  const requestCoachMutation = useMutation({
    mutationFn: async (requestedMentorId?: string) => {
      const result = await mentorshipApi.requestCoach(requestedMentorId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      invalidateAll();
      if (data.outcome === 'matched') {
        Alert.alert('Coach assigned', 'You have been matched with a mentor.');
      } else {
        Alert.alert(
          'On the waiting list',
          `You are #${data.queuePosition} in the queue. We will assign you when a coach has capacity.`,
        );
      }
    },
    onError: (e: Error) => Alert.alert('Request failed', e.message),
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId?: string) => {
      const result = await mentorshipApi.cancelRequest(requestId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidateAll();
      Alert.alert('Cancelled', 'Your mentorship request was cancelled.');
    },
    onError: (e: Error) => Alert.alert('Cancel failed', e.message),
  });

  const leaveMutation = useMutation({
    mutationFn: async ({ mentorshipId, reason }: { mentorshipId: string; reason?: string }) => {
      const result = await mentorshipApi.leaveMentorship(mentorshipId, reason);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidateAll();
      Alert.alert('Left mentorship', 'You can request a new coach when ready.');
    },
    onError: (e: Error) => Alert.alert('Could not leave', e.message),
  });

  const removeMenteeMutation = useMutation({
    mutationFn: async ({ mentorshipId, reason }: { mentorshipId: string; reason?: string }) => {
      const result = await mentorshipApi.removeMentee(mentorshipId, reason);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidateAll();
      Alert.alert('Student removed', 'Their slot is now available for the waiting list.');
    },
    onError: (e: Error) => Alert.alert('Remove failed', e.message),
  });

  return {
    requestCoach: requestCoachMutation.mutate,
    isRequesting: requestCoachMutation.isPending,
    cancelRequest: cancelRequestMutation.mutate,
    isCancelling: cancelRequestMutation.isPending,
    leaveMentorship: leaveMutation.mutate,
    isLeaving: leaveMutation.isPending,
    removeMentee: removeMenteeMutation.mutate,
    isRemoving: removeMenteeMutation.isPending,
    invalidateAll,
  };
}
