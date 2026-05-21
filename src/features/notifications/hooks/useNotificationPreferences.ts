import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/constants/query-keys';
import { notificationPreferencesApi } from '@/services/api';
import type { NotificationPreferences } from '@/types/domain/notification';

type PreferenceKey = keyof Pick<
  NotificationPreferences,
  'pushEnabled' | 'newMatches' | 'deadlineReminders' | 'savedReminders'
>;

export function useNotificationPreferences() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.notifications.preferences(userId ?? ''),
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await notificationPreferencesApi.ensure(userId);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(userId),
  });

  const updateMutation = useMutation({
    mutationFn: async (patch: Partial<Record<PreferenceKey, boolean>>) => {
      if (!userId) return null;
      const { data, error } = await notificationPreferencesApi.update(userId, patch);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      if (!userId) return;
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.preferences(userId),
      });
    },
  });

  const setPreference = (key: PreferenceKey, value: boolean) => {
    const map: Record<PreferenceKey, string> = {
      pushEnabled: 'pushEnabled',
      newMatches: 'newMatches',
      deadlineReminders: 'deadlineReminders',
      savedReminders: 'savedReminders',
    };
    return updateMutation.mutateAsync({ [map[key]]: value });
  };

  return {
    preferences: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    setPreference,
    isSaving: updateMutation.isPending,
  };
}
