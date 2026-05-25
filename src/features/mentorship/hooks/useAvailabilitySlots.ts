import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';

import { queryKeys } from '@/constants/query-keys';
import { mentorshipSchedulingApi } from '@/services/api/mentorship-scheduling.api';
import { supabase } from '@/services/supabase/client';
import type { AvailabilitySlot } from '@/types/domain/mentorship';

export function useAvailabilitySlots(coachId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = queryKeys.mentorship.availabilitySlots(coachId ?? '');

  const query = useQuery({
    queryKey,
    queryFn: async () => {
      if (!coachId) return [];
      const result = await mentorshipSchedulingApi.listAvailabilitySlots(coachId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(coachId),
  });

  useEffect(() => {
    if (!coachId) return;

    const channel = supabase
      .channel(`availability_slots:${coachId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'availability_slots',
          filter: `coach_id=eq.${coachId}`,
        },
        () => {
          void queryClient.invalidateQueries({ queryKey });
        },
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [coachId, queryClient, queryKey]);

  const toggleMutation = useMutation({
    mutationFn: mentorshipSchedulingApi.toggleAvailabilitySlot,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey });
    },
  });

  const toggleSlot = async (input: {
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    timezone?: string;
  }) => {
    const result = await toggleMutation.mutateAsync(input);
    if (!result.success) throw new Error(result.error.message);
    return result.data;
  };

  return {
    slots: (query.data ?? []) as AvailabilitySlot[],
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,
    toggleSlot,
    isToggling: toggleMutation.isPending,
  };
}
