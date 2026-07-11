import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, type Href } from 'expo-router';
import { Alert } from 'react-native';

import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await adminApi.approveOpportunity(id, notes);
      if (error) throw error;
    },
    onSuccess: (_data, { id }) => {
      Alert.alert(t('admin.mutations.approvedTitle'), t('admin.mutations.approvedMessage'));
      refreshPendingAndLive(queryClient);
      if (isSuperAdmin) {
        void supabase.functions.invoke('send-new-opportunity-emails', { body: { opportunity_id: id } });
      }
    },
    onError: (error) => {
      Alert.alert(
        t('admin.mutations.couldNotApprove'),
        error instanceof Error ? error.message : t('admin.mutations.tryAgain'),
      );
    },
  });
}

export function useRejectOpportunityMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({ id, notes }: { id: string; notes?: string }) => {
      const { error } = await adminApi.rejectOpportunity(id, notes);
      if (error) throw error;
    },
    onSuccess: () => {
      Alert.alert(t('admin.mutations.rejectedTitle'), t('admin.mutations.rejectedMessage'));
      refreshPendingAndLive(queryClient);
    },
    onError: (error) => {
      Alert.alert(
        t('admin.mutations.couldNotReject'),
        error instanceof Error ? error.message : t('admin.mutations.tryAgain'),
      );
    },
  });
}

export function useCreateOpportunityMutation(listRoute: Href = ROUTES.ADMIN.HOME as Href) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isSuperAdmin } = useAuth();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (values: OpportunityFormValues) => {
      const { data, error } = await adminApi.createOpportunity(values);
      if (error) throw error;
      if (!data) throw new Error(t('admin.mutations.opportunityNotSaved'));
      return data;
    },
    onSuccess: (data) => {
      Alert.alert(t('admin.mutations.postedTitle'), t('admin.mutations.postedMessage', { title: data.title }));
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
        error instanceof Error ? error.message : t('admin.mutations.couldNotCreateFallback');
      Alert.alert(t('admin.mutations.couldNotCreate'), message);
    },
  });
}

export function useUpdateOpportunityMutation(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (values: OpportunityFormValues) => {
      const { data, error } = await adminApi.updateOpportunity(id, values);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      Alert.alert(t('admin.mutations.savedTitle'), t('admin.mutations.savedMessage'));
      router.back();
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunities });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.opportunity(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.opportunities.detail(id) });
      refreshOpportunityFeeds(queryClient);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : t('admin.mutations.couldNotSaveFallback');
      Alert.alert(t('admin.mutations.couldNotSave'), message);
    },
  });
}

export function useUpdateAndApproveMutation(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { isSuperAdmin } = useAuth();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (values: OpportunityFormValues) => {
      const { error: updateError } = await adminApi.updateOpportunity(id, values);
      if (updateError) throw updateError;
      const { error: approveError } = await adminApi.approveOpportunity(id);
      if (approveError) throw approveError;
    },
    onSuccess: () => {
      Alert.alert(t('admin.mutations.approvedTitle'), t('admin.mutations.approvedMessage'));
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
      Alert.alert(
        t('admin.mutations.couldNotApprove'),
        error instanceof Error ? error.message : t('admin.mutations.tryAgain'),
      );
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
