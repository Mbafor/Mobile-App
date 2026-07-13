import { useMutation, useQueryClient } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSavedOpportunityIds } from '@/features/opportunities/hooks/useSavedOpportunityIds';
import { queryKeys } from '@/constants/query-keys';
import { savedOpportunitiesApi } from '@/services/api';

export function useToggleSaveOpportunity(opportunityId: string) {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();
  const savedQuery = useSavedOpportunityIds();

  const isSaved = Boolean(savedQuery.data?.includes(opportunityId));
  const savedListKey = queryKeys.opportunities.saved(userId);
  const savedCountKey = [...savedListKey, 'count'] as const;

  const mutation = useMutation({
    mutationFn: async (nextSaved: boolean) => {
      if (!userId) throw new Error('Not signed in');

      if (nextSaved) {
        const { error } = await savedOpportunitiesApi.save(userId, opportunityId);
        if (error) throw error;
      } else {
        const { error } = await savedOpportunitiesApi.unsave(userId, opportunityId);
        if (error) throw error;
      }
      return nextSaved;
    },
    onMutate: async (nextSaved: boolean) => {
      await queryClient.cancelQueries({ queryKey: savedListKey });

      const previousIds = queryClient.getQueryData<string[]>(savedListKey);
      const previousCount = queryClient.getQueryData<number>(savedCountKey);

      queryClient.setQueryData<string[]>(savedListKey, (old) => {
        const list = old ?? [];
        if (nextSaved) {
          return list.includes(opportunityId) ? list : [...list, opportunityId];
        }
        return list.filter((id) => id !== opportunityId);
      });
      queryClient.setQueryData<number>(savedCountKey, (old) =>
        Math.max(0, (old ?? 0) + (nextSaved ? 1 : -1)),
      );

      return { previousIds, previousCount };
    },
    onError: (_err, _nextSaved, context) => {
      if (context?.previousIds !== undefined) {
        queryClient.setQueryData(savedListKey, context.previousIds);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(savedCountKey, context.previousCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: savedListKey });
      queryClient.invalidateQueries({ queryKey: savedCountKey });
    },
  });

  return {
    isSaved,
    toggleSave: () => mutation.mutate(!isSaved),
    isSaving: mutation.isPending,
  };
}
