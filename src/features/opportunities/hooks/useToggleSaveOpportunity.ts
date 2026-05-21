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

  const mutation = useMutation({
    mutationFn: async () => {
      if (!userId) throw new Error('Not signed in');

      const { saved, error: checkError } = await savedOpportunitiesApi.isSaved(
        userId,
        opportunityId,
      );
      if (checkError) throw checkError;

      if (saved) {
        const { error } = await savedOpportunitiesApi.unsave(userId, opportunityId);
        if (error) throw error;
        return false;
      }

      const { error } = await savedOpportunitiesApi.save(userId, opportunityId);
      if (error) throw error;
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.saved(userId) });
      queryClient.invalidateQueries({
        queryKey: [...queryKeys.opportunities.saved(userId), 'count'],
      });
    },
  });

  return {
    isSaved,
    toggleSave: () => mutation.mutate(),
    isSaving: mutation.isPending,
  };
}
