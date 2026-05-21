import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/constants/query-keys';
import { notificationsApi } from '@/services/api';

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const listQuery = useQuery({
    queryKey: queryKeys.notifications.list(userId ?? ''),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await notificationsApi.list(userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
  });

  const unreadQuery = useQuery({
    queryKey: queryKeys.notifications.unreadCount(userId ?? ''),
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await notificationsApi.unreadCount(userId);
      if (error) throw error;
      return count;
    },
    enabled: Boolean(userId),
  });

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) return;
      const { error } = await notificationsApi.markRead(userId, notificationId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (!userId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(userId),
      });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await notificationsApi.markAllRead(userId);
      if (error) throw error;
    },
    onSuccess: () => {
      if (!userId) return;
      void queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list(userId) });
      void queryClient.invalidateQueries({
        queryKey: queryKeys.notifications.unreadCount(userId),
      });
    },
  });

  return {
    notifications: listQuery.data ?? [],
    unreadCount: unreadQuery.data ?? 0,
    isLoading: listQuery.isLoading,
    isRefetching: listQuery.isRefetching,
    error: listQuery.error,
    refetch: listQuery.refetch,
    markRead: markReadMutation.mutateAsync,
    markAllRead: markAllReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending || markAllReadMutation.isPending,
  };
}
