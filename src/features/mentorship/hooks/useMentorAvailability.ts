import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { mentorshipDataApi } from '@/services/api';
import type { MentorAvailabilityRule } from '@/types/domain/mentorship';

export function useMentorAvailability(mentorId: string | undefined) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: queryKeys.mentorship.availability(mentorId ?? ''),
    queryFn: async () => {
      if (!mentorId) return [];
      const result = await mentorshipDataApi.listAvailability(mentorId);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    enabled: Boolean(mentorId),
  });

  const saveMutation = useMutation({
    mutationFn: async (rule: Omit<MentorAvailabilityRule, 'mentorId'> & { id?: string }) => {
      if (!mentorId) throw new Error('Missing mentor');
      const result = await mentorshipDataApi.upsertAvailabilityRule(mentorId, rule);
      if (!result.success) throw new Error(result.error.message);
      return result.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.mentorship.availability(mentorId ?? ''),
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (ruleId: string) => {
      if (!mentorId) throw new Error('Missing mentor');
      const result = await mentorshipDataApi.deleteAvailabilityRule(mentorId, ruleId);
      if (!result.success) throw new Error(result.error.message);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.mentorship.availability(mentorId ?? ''),
      });
    },
  });

  return {
    rules: query.data ?? [],
    isLoading: query.isLoading,
    error: query.error,
    saveRule: saveMutation.mutate,
    deleteRule: deleteMutation.mutate,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
