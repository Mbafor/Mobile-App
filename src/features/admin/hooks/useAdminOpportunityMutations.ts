import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'expo-router';
import { Alert } from 'react-native';

import { queryKeys } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';
import { adminApi } from '@/services/api';

async function refreshOpportunityFeeds(queryClient: ReturnType<typeof useQueryClient>) {
  await queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
  await queryClient.refetchQueries({ queryKey: queryKeys.opportunities.all });
}

export function useCreateOpportunityMutation() {
  const queryClient = useQueryClient();
  const router = useRouter();

  return useMutation({
    mutationFn: async (values: OpportunityFormValues) => {
      const { data, error } = await adminApi.createOpportunity(values);
      if (error) throw error;
      return data;
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunities });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics });
      await refreshOpportunityFeeds(queryClient);
      Alert.alert('Posted', 'Your opportunity is live for students to browse.');
      router.replace(ROUTES.ADMIN.OPPORTUNITIES);
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunities });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunity(id) });
      await queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.detail(id) });
      await refreshOpportunityFeeds(queryClient);
      Alert.alert('Saved', 'Changes are live for students.');
      router.back();
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
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunities });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      await queryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics });
      await refreshOpportunityFeeds(queryClient);
    },
  });
}
