import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as Linking from 'expo-linking';
import { openExternalUrl } from '@/utils/web/openExternalUrl';
import { Alert } from 'react-native';

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

  const appliedQuery = useQuery({
    queryKey: queryKeys.opportunities.applied(userId, opportunityId ?? ''),
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

  const invalidateSaved = () => {
    queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.saved(userId) });
    queryClient.invalidateQueries({
      queryKey: [...queryKeys.opportunities.saved(userId), 'count'],
    });
    queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.tracker(userId) });
  };

  const invalidateApplied = () => {
    if (!opportunityId) return;
    queryClient.invalidateQueries({
      queryKey: queryKeys.opportunities.applied(userId, opportunityId),
    });
    queryClient.invalidateQueries({ queryKey: ['opportunities', 'applied-count', userId] });
    queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.tracker(userId) });
  };

  const toggleSaveMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !opportunityId) throw new Error('Not signed in');

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
    onSuccess: () => invalidateSaved(),
  });

  const toggleAppliedMutation = useMutation({
    mutationFn: async () => {
      if (!userId || !opportunityId) throw new Error('Not signed in');

      const { applied, error: checkError } = await appliedOpportunitiesApi.isApplied(
        userId,
        opportunityId,
      );
      if (checkError) throw checkError;

      if (applied) {
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
    onSuccess: () => invalidateApplied(),
  });

  const applyNow = async (opportunity: Opportunity) => {
    const url = opportunity.applyUrl?.trim();
    if (!url) {
      Alert.alert('No apply link', 'This opportunity does not have an application URL yet.');
      return;
    }

    const canOpen = await Linking.canOpenURL(url);
    if (!canOpen) {
      Alert.alert('Invalid link', 'Could not open the application URL.');
      return;
    }

    await openExternalUrl(url);
  };

  return {
    isSaved,
    isApplied: appliedQuery.data ?? false,
    isSaving: toggleSaveMutation.isPending,
    isApplying: toggleAppliedMutation.isPending,
    toggleSave: () => toggleSaveMutation.mutate(),
    toggleApplied: () => toggleAppliedMutation.mutate(),
    applyNow,
    shareOpportunity: shareOpportunityMessage,
  };
}
