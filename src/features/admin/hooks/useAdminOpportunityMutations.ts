import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, type Href } from 'expo-router';
import { Alert } from 'react-native';

import { queryKeys } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';
import { adminApi } from '@/services/api';

function refreshOpportunityFeeds(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
}

export function useCreateOpportunityMutation(listRoute: Href = ROUTES.ADMIN.HOME as Href) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: OpportunityFormValues) => {
      const { data, error } = await adminApi.createOpportunity(values);
      if (error) throw error;
      if (!data) throw new Error('Opportunity was not saved. Please try again.');
      return data;
    },
    onSuccess: (data) => {
      Alert.alert('Posted', `"${data.title}" is live for students to browse.`);
      router.replace(listRoute);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunities });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics });
      refreshOpportunityFeeds(queryClient);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Could not create this opportunity.';
      Alert.alert('Could not create', message);
    },
  });
}

export function useUpdateOpportunityMutation(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: OpportunityFormValues) => {
      const { data, error } = await adminApi.updateOpportunity(id, values);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      Alert.alert('Saved', 'Changes are live for students.');
      router.back();
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunities });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunity(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.detail(id) });
      refreshOpportunityFeeds(queryClient);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : 'Could not save changes.';
      Alert.alert('Could not save', message);
    },
  });
}

export function useDeleteOpportunityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await adminApi.deleteOpportunity(id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunities });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics });
      refreshOpportunityFeeds(queryClient);
    },
  });
}
