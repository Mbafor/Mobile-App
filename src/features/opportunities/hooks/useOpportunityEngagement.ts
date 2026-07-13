import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { openExternalUrl } from '@/utils/web/openExternalUrl';
import { Alert, Platform } from 'react-native';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { useSavedOpportunityIds } from '@/features/opportunities/hooks/useSavedOpportunityIds';
import { shareOpportunity as shareOpportunityMessage } from '@/features/opportunities/utils/share-opportunity';
import { queryKeys } from '@/constants/query-keys';
import {
  appliedOpportunitiesApi,
  savedOpportunitiesApi,
  trackerApi,
} from '@/services/api';
import type { Opportunity } from '@/types/domain/opportunity';

export function useOpportunityEngagement(opportunityId: string | undefined) {
  const { user } = useAuth();
  const userId = user?.id ?? '';
  const queryClient = useQueryClient();

  const savedQuery = useSavedOpportunityIds();
  const isSaved = Boolean(
    opportunityId && savedQuery.data?.includes(opportunityId),
  );

  const savedListKey = queryKeys.opportunities.saved(userId);
  const savedCountKey = [...savedListKey, 'count'] as const;
  const appliedKey = queryKeys.opportunities.applied(userId, opportunityId ?? '');
  const appliedCountKey = ['opportunities', 'applied-count', userId] as const;

  const appliedQuery = useQuery({
    queryKey: appliedKey,
    queryFn: async () => {
      if (!userId || !opportunityId) return false;
      const { applied, error } = await appliedOpportunitiesApi.isApplied(
        userId,
        opportunityId,
      );
      if (error) throw error;
      return applied;
    },
    enabled: Boolean(userId && opportunityId),
  });

  const toggleSaveMutation = useMutation({
    mutationFn: async (nextSaved: boolean) => {
      if (!userId || !opportunityId) throw new Error('Not signed in');

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
      if (!opportunityId) return {};
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
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.tracker(userId) });
    },
  });

  const toggleAppliedMutation = useMutation({
    mutationFn: async (nextApplied: boolean) => {
      if (!userId || !opportunityId) throw new Error('Not signed in');

      if (!nextApplied) {
        const { error } = await appliedOpportunitiesApi.unmarkApplied(
          userId,
          opportunityId,
        );
        if (error) throw error;
        const { saved } = await savedOpportunitiesApi.isSaved(userId, opportunityId);
        if (saved) {
          await trackerApi.updateStage(userId, opportunityId, 'saved');
        }
        return false;
      }

      const { error } = await appliedOpportunitiesApi.markApplied(userId, opportunityId);
      if (error) throw error;
      const { saved } = await savedOpportunitiesApi.isSaved(userId, opportunityId);
      if (saved) {
        await trackerApi.updateStage(userId, opportunityId, 'applied');
      }
      return true;
    },
    onMutate: async (nextApplied: boolean) => {
      await queryClient.cancelQueries({ queryKey: appliedKey });

      const previousApplied = queryClient.getQueryData<boolean>(appliedKey);
      const previousCount = queryClient.getQueryData<number>(appliedCountKey);

      queryClient.setQueryData<boolean>(appliedKey, nextApplied);
      queryClient.setQueryData<number>(appliedCountKey, (old) =>
        Math.max(0, (old ?? 0) + (nextApplied ? 1 : -1)),
      );

      return { previousApplied, previousCount };
    },
    onError: (_err, _nextApplied, context) => {
      if (context?.previousApplied !== undefined) {
        queryClient.setQueryData(appliedKey, context.previousApplied);
      }
      if (context?.previousCount !== undefined) {
        queryClient.setQueryData(appliedCountKey, context.previousCount);
      }
    },
    onSettled: () => {
      if (!opportunityId) return;
      queryClient.invalidateQueries({ queryKey: appliedKey });
      queryClient.invalidateQueries({ queryKey: appliedCountKey });
      queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.tracker(userId) });
    },
  });

  const applyNow = async (opportunity: Opportunity) => {
    const url = opportunity.applyUrl?.trim();
    if (!url) {
      Alert.alert('No apply link', 'This opportunity does not have an application URL yet.');
      return;
    }

    // On web, canOpenURL is always true for https:// and awaiting it would expire
    // Safari's user-gesture context, causing window.open to be blocked.
    if (Platform.OS !== 'web') {
      const canOpen = await Linking.canOpenURL(url);
      if (!canOpen) {
        Alert.alert('Invalid link', 'Could not open the application URL.');
        return;
      }
    }

    void openExternalUrl(url);

    // Best-effort: if this opportunity is tracked and still at 'saved', bump it to
    // 'applied' now that the user has opened the application link. No-ops (and never
    // alerts) if it's untracked or already further along — this shouldn't interrupt
    // the apply flow.
    if (userId && isSaved) {
      void trackerApi.advanceToApplied(userId, opportunity.id).then(({ advanced }) => {
        if (!advanced) return;
        queryClient.setQueryData<boolean>(
          queryKeys.opportunities.applied(userId, opportunity.id),
          true,
        );
        queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.tracker(userId) });
        queryClient.invalidateQueries({
          queryKey: ['opportunities', 'applied-count', userId],
        });
      });
    }
  };

  return {
    isSaved,
    isApplied: appliedQuery.data ?? false,
    isSaving: toggleSaveMutation.isPending,
    isApplying: toggleAppliedMutation.isPending,
    toggleSave: () => toggleSaveMutation.mutate(!isSaved),
    toggleApplied: () => toggleAppliedMutation.mutate(!(appliedQuery.data ?? false)),
    applyNow,
    shareOpportunity: shareOpportunityMessage,
  };
}
