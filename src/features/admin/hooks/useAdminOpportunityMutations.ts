import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, type Href } from 'expo-router';
import { Alert } from 'react-native';

import { queryKeys } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import type { OpportunityFormValues } from '@/features/admin/types/opportunity-form';
import { useAuth } from '@/features/auth/hooks/useAuth';
import { adminApi } from '@/services/api';
import { supabase } from '@/services/supabase/client';

function refreshOpportunityFeeds(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.all });
}

function refreshPendingAndLive(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.admin.pendingOpportunities });
  void queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunities });
  refreshOpportunityFeeds(queryClient);
}

export function useApproveOpportunityMutation() {
  const queryClient = useQueryClient();
  const { isSuperAdmin } = useAuth();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await adminApi.approveOpportunity(id, notes);
      if (error) throw error;
    },
    onSuccess: (_data, { id }) => {
      Alert.alert('Approved', 'The opportunity is now live for students.');
      refreshPendingAndLive(queryClient);
      if (isSuperAdmin) {
        void supabase.functions.invoke('send-new-opportunity-emails', { body: { opportunity_id: id } });
      }
    },
    onError: (error) => {
      Alert.alert('Could not approve', error instanceof Error ? error.message : 'Please try again.');
    },
  });
}

export function useRejectOpportunityMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await adminApi.rejectOpportunity(id, notes);
      if (error) throw error;
    },
    onSuccess: () => {
      Alert.alert('Rejected', 'The opportunity has been removed from the queue.');
      refreshPendingAndLive(queryClient);
    },
    onError: (error) => {
      Alert.alert('Could not reject', error instanceof Error ? error.message : 'Please try again.');
    },
  });
}

export function useCreateOpportunityMutation(listRoute: Href = ROUTES.ADMIN.HOME as Href) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isSuperAdmin } = useAuth();

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
      if (isSuperAdmin) {
        void supabase.functions.invoke('send-new-opportunity-emails', { body: { opportunity_id: data.id } });
      }
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

export function useUpdateAndApproveMutation(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isSuperAdmin } = useAuth();

  return useMutation({
    mutationFn: async (values: OpportunityFormValues) => {
      const { error: updateError } = await adminApi.updateOpportunity(id, values);
      if (updateError) throw updateError;
      const { error: approveError } = await adminApi.approveOpportunity(id);
      if (approveError) throw approveError;
    },
    onSuccess: () => {
      Alert.alert('Approved', 'The opportunity is now live for students.');
      router.back();
      refreshPendingAndLive(queryClient);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunity(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.stats });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.analytics });
      if (isSuperAdmin) {
        void supabase.functions.invoke('send-new-opportunity-emails', { body: { opportunity_id: id } });
      }
    },
    onError: (error) => {
      Alert.alert('Could not approve', error instanceof Error ? error.message : 'Please try again.');
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
