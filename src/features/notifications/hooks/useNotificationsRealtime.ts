import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { supabase } from '@/services/supabase/client';

/** Subscribe to in-app notification inserts/updates for the signed-in user. */
export function useNotificationsRealtime(userId: string | undefined) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel(`notifications:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.list(userId),
          });
          void queryClient.invalidateQueries({
            queryKey: queryKeys.notifications.unreadCount(userId),
          });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [queryClient, userId]);
}
