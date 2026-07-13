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
    onMutate: async (input) => {
      await queryClient.cancelQueries({ queryKey });

      const previousSlots = queryClient.getQueryData<AvailabilitySlot[]>(queryKey);

      queryClient.setQueryData<AvailabilitySlot[]>(queryKey, (old) => {
        const list = old ?? [];
        const matchIndex = list.findIndex(
          (slot) =>
            slot.dayOfWeek === input.dayOfWeek &&
            slot.startTime === input.startTime &&
            slot.endTime === input.endTime,
        );
        if (matchIndex >= 0) {
          return list.filter((_, i) => i !== matchIndex);
        }
        return [
          ...list,
          {
            id: `optimistic-${input.dayOfWeek}-${input.startTime}-${input.endTime}`,
            coachId: coachId ?? '',
            dayOfWeek: input.dayOfWeek,
            startTime: input.startTime,
            endTime: input.endTime,
            timezone: input.timezone ?? Intl.DateTimeFormat().resolvedOptions().timeZone ?? 'UTC',
          },
        ];
      });

      return { previousSlots };
    },
    onError: (_err, _input, context) => {
      if (context?.previousSlots !== undefined) {
        queryClient.setQueryData(queryKey, context.previousSlots);
      }
    },
    onSuccess: (result, _input, context) => {
      // mentorshipSchedulingApi never throws for API-level failures — it resolves
      // with { success: false }, so a rollback has to happen here too, not just onError.
      if (!result.success && context?.previousSlots !== undefined) {
        queryClient.setQueryData(queryKey, context.previousSlots);
      }
    },
    onSettled: () => {
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
