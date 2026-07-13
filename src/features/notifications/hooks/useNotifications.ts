import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/constants/query-keys';
import { notificationsApi } from '@/services/api';
import type { AppNotification } from '@/types/domain/notification';

export function useNotifications() {
  const { user } = useAuth();
  const userId = user?.id;
  const queryClient = useQueryClient();

  const listKey = queryKeys.notifications.list(userId ?? '');
  const unreadKey = queryKeys.notifications.unreadCount(userId ?? '');

  const listQuery = useQuery({
    queryKey: listKey,
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await notificationsApi.list(userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
  });

  const unreadQuery = useQuery({
    queryKey: unreadKey,
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await notificationsApi.unreadCount(userId);
      if (error) throw error;
      return count;
    },
    enabled: Boolean(userId),
  });

  const invalidateAll = () => {
    if (!userId) return;
    void queryClient.invalidateQueries({ queryKey: listKey });
    void queryClient.invalidateQueries({ queryKey: unreadKey });
  };

  const snapshot = async () => {
    await queryClient.cancelQueries({ queryKey: listKey });
    await queryClient.cancelQueries({ queryKey: unreadKey });
    return {
      previousList: queryClient.getQueryData<AppNotification[]>(listKey),
      previousUnread: queryClient.getQueryData<number>(unreadKey),
    };
  };

  const rollback = (context?: { previousList?: AppNotification[]; previousUnread?: number }) => {
    if (context?.previousList !== undefined) {
      queryClient.setQueryData(listKey, context.previousList);
    }
    if (context?.previousUnread !== undefined) {
      queryClient.setQueryData(unreadKey, context.previousUnread);
    }
  };

  const markReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) return;
      const { error } = await notificationsApi.markRead(userId, notificationId);
      if (error) throw error;
    },
    onMutate: async (notificationId: string) => {
      const context = await snapshot();
      const wasUnread = context.previousList?.some(
        (n) => n.id === notificationId && !n.readAt,
      );

      queryClient.setQueryData<AppNotification[]>(listKey, (old) =>
        (old ?? []).map((n) =>
          n.id === notificationId && !n.readAt
            ? { ...n, readAt: new Date().toISOString() }
            : n,
        ),
      );
      if (wasUnread) {
        queryClient.setQueryData<number>(unreadKey, (old) => Math.max(0, (old ?? 0) - 1));
      }

      return context;
    },
    onError: (_err, _id, context) => rollback(context),
    onSettled: invalidateAll,
  });

  const markAllReadMutation = useMutation({
    mutationFn: async () => {
      if (!userId) return;
      const { error } = await notificationsApi.markAllRead(userId);
      if (error) throw error;
    },
    onMutate: async () => {
      const context = await snapshot();
      const now = new Date().toISOString();

      queryClient.setQueryData<AppNotification[]>(listKey, (old) =>
        (old ?? []).map((n) => (n.readAt ? n : { ...n, readAt: now })),
      );
      queryClient.setQueryData<number>(unreadKey, 0);

      return context;
    },
    onError: (_err, _vars, context) => rollback(context),
    onSettled: invalidateAll,
  });

  const deleteMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      if (!userId) return;
      const { error } = await notificationsApi.delete(userId, notificationId);
      if (error) throw error;
    },
    onMutate: async (notificationId: string) => {
      const context = await snapshot();
      const removed = context.previousList?.find((n) => n.id === notificationId);

      queryClient.setQueryData<AppNotification[]>(listKey, (old) =>
        (old ?? []).filter((n) => n.id !== notificationId),
      );
      if (removed && !removed.readAt) {
        queryClient.setQueryData<number>(unreadKey, (old) => Math.max(0, (old ?? 0) - 1));
      }

      return context;
    },
    onError: (_err, _id, context) => rollback(context),
    onSettled: invalidateAll,
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
    deleteNotification: deleteMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending || markAllReadMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
