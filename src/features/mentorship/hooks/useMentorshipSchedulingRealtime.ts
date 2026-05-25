import { useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { mentorshipSchedulingApi } from '@/services/api/mentorship-scheduling.api';
import { supabase } from '@/services/supabase/client';

/** Invalidate session queries when mentorship_sessions change (live calendar updates). */
export function useMentorshipSchedulingRealtime(
  userId: string | undefined,
  mentorshipId?: string,
) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!userId) return;

    const filter = mentorshipId ? `mentorship_id=eq.${mentorshipId}` : undefined;

    const channel = supabase
      .channel(`mentorship_sessions:${userId}:${mentorshipId ?? 'all'}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'mentorship_sessions',
          ...(filter ? { filter } : {}),
        },
        () => {
          void queryClient.invalidateQueries({
            queryKey: queryKeys.mentorship.sessions(userId),
          });
          void mentorshipSchedulingApi.completePastSessions();
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [userId, mentorshipId, queryClient]);
}
