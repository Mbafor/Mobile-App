import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { Alert } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { mentorshipApi } from '@/services/api';

export function useMentorshipActions() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ['mentorship'] });
  };

  const chooseCoachMutation = useMutation({
    mutationFn: async (mentorUserId: string) => {
      if (!mentorUserId?.trim()) {
        throw new Error(t('mentorship.actions.selectCoachError'));
      }
      const result = await mentorshipApi.chooseCoach(mentorUserId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidateAll();
      Alert.alert(
        t('mentorship.actions.coachConnectedTitle'),
        t('mentorship.actions.coachConnectedMessage'),
      );
    },
    onError: (e: Error) => Alert.alert(t('mentorship.actions.couldNotConnect'), e.message),
  });

  const joinWaitingListMutation = useMutation({
    mutationFn: async () => {
      const result = await mentorshipApi.joinMentorshipWaitingList();
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: (data) => {
      invalidateAll();
      if (data.outcome === 'waiting_list') {
        Alert.alert(
          t('mentorship.actions.waitingListTitle'),
          t('mentorship.actions.waitingListMessage', { position: data.queuePosition }),
        );
      }
    },
    onError: (e: Error) => Alert.alert(t('mentorship.actions.requestFailed'), e.message),
  });

  const cancelRequestMutation = useMutation({
    mutationFn: async (requestId?: string) => {
      const result = await mentorshipApi.cancelRequest(requestId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidateAll();
      Alert.alert(t('mentorship.actions.cancelledTitle'), t('mentorship.actions.cancelledMessage'));
    },
    onError: (e: Error) => Alert.alert(t('mentorship.actions.cancelFailed'), e.message),
  });

  const leaveMutation = useMutation({
    mutationFn: async ({ mentorshipId, reason }: { mentorshipId: string; reason?: string }) => {
      const result = await mentorshipApi.leaveMentorship(mentorshipId, reason);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidateAll();
      Alert.alert(t('mentorship.actions.leftTitle'), t('mentorship.actions.leftMessage'));
    },
    onError: (e: Error) => Alert.alert(t('mentorship.actions.couldNotLeave'), e.message),
  });

  const removeMenteeMutation = useMutation({
    mutationFn: async ({ mentorshipId, reason }: { mentorshipId: string; reason?: string }) => {
      const result = await mentorshipApi.removeMentee(mentorshipId, reason);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      invalidateAll();
      Alert.alert(t('mentorship.actions.studentRemovedTitle'), t('mentorship.actions.studentRemovedMessage'));
    },
    onError: (e: Error) => Alert.alert(t('mentorship.actions.removeFailed'), e.message),
  });

  return {
    chooseCoach: chooseCoachMutation.mutate,
    chooseCoachAsync: chooseCoachMutation.mutateAsync,
    isChoosingCoach: chooseCoachMutation.isPending,
    joinWaitingList: joinWaitingListMutation.mutate,
    isJoiningWaitingList: joinWaitingListMutation.isPending,
    cancelRequest: cancelRequestMutation.mutate,
    isCancelling: cancelRequestMutation.isPending,
    leaveMentorship: leaveMutation.mutate,
    isLeaving: leaveMutation.isPending,
    removeMentee: removeMenteeMutation.mutate,
    isRemoving: removeMenteeMutation.isPending,
    invalidateAll,
  };
}
