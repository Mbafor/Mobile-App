import { useMemo } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';

import { queryKeys } from '@/constants/query-keys';
import { useActiveOpportunities } from '@/features/opportunities/hooks/useActiveOpportunities';
import { useAuth } from '@/features/auth/hooks/useAuth';
import type { TrackerItem } from '@/features/opportunities/utils/filter-tracker';
import { trackerApi } from '@/services/api';
import type { TrackerRow } from '@/services/api/tracker.api';
import type { TrackerStage } from '@/types/domain/tracker';

export function useTrackerOpportunities() {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const trackerQuery = useQuery({
    queryKey: queryKeys.opportunities.tracker(userId),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await trackerApi.listTracked(userId);
      if (error) throw error;
      return data ?? [];
    },
    enabled: Boolean(userId),
  });

  const activeQuery = useActiveOpportunities();

  const items = useMemo((): TrackerItem[] => {
    const rows = trackerQuery.data ?? [];
    if (rows.length === 0) return [];

    const byId = new Map((activeQuery.data ?? []).map((o) => [o.id, o]));
    return rows
      .map((row) => {
        const opportunity = byId.get(row.opportunityId);
        if (!opportunity) return null;
        return {
          opportunityId: row.opportunityId,
          stage: row.stage,
          notes: row.notes,
          savedAt: row.savedAt,
          updatedAt: row.updatedAt,
          opportunity,
        };
      })
      .filter((item): item is TrackerItem => Boolean(item));
  }, [trackerQuery.data, activeQuery.data]);

  const trackerKey = queryKeys.opportunities.tracker(userId);

  const invalidateTracker = () => {
    queryClient.invalidateQueries({ queryKey: trackerKey });
    queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.saved(userId) });
    queryClient.invalidateQueries({ queryKey: [...queryKeys.opportunities.saved(userId), 'count'] });
    queryClient.invalidateQueries({ queryKey: ['opportunities', 'applied-count', userId] });
  };

  const updateStageMutation = useMutation({
    mutationFn: async ({
      opportunityId,
      stage,
    }: {
      opportunityId: string;
      stage: TrackerStage;
    }) => {
      if (!userId) throw new Error('Not signed in');
      const { error } = await trackerApi.updateStage(userId, opportunityId, stage);
      if (error) throw error;
    },
    onMutate: async ({ opportunityId, stage }) => {
      await queryClient.cancelQueries({ queryKey: trackerKey });

      const previousRows = queryClient.getQueryData<TrackerRow[]>(trackerKey);

      queryClient.setQueryData<TrackerRow[]>(trackerKey, (old) =>
        (old ?? []).map((row) =>
          row.opportunityId === opportunityId ? { ...row, stage } : row,
        ),
      );

      return { previousRows };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRows !== undefined) {
        queryClient.setQueryData(trackerKey, context.previousRows);
      }
    },
    onSettled: invalidateTracker,
  });

  const updateNotesMutation = useMutation({
    mutationFn: async ({
      opportunityId,
      notes,
    }: {
      opportunityId: string;
      notes: string;
    }) => {
      if (!userId) throw new Error('Not signed in');
      const { error } = await trackerApi.updateNotes(userId, opportunityId, notes);
      if (error) throw error;
    },
    onSuccess: invalidateTracker,
  });

  return {
    items,
    isLoading: trackerQuery.isLoading || activeQuery.isLoading,
    isRefetching: trackerQuery.isRefetching || activeQuery.isRefetching,
    error: trackerQuery.error ?? activeQuery.error,
    refetch: async () => {
      await Promise.all([trackerQuery.refetch(), activeQuery.refetch()]);
    },
    updateStage: updateStageMutation.mutate,
    updateStageAsync: updateStageMutation.mutateAsync,
    isUpdatingStage: updateStageMutation.isPending,
    updateNotes: updateNotesMutation.mutate,
    isUpdatingNotes: updateNotesMutation.isPending,
  };
}
