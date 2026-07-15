import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter, type Href } from 'expo-router';
import { Alert } from 'react-native';

import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/constants/query-keys';
import { ROUTES } from '@/constants/routes';
import type { EventFormValues } from '@/features/admin/types/event-form';
import { adminApi } from '@/services/api';

function refreshEventFeeds(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: queryKeys.events.upcoming });
  void queryClient.invalidateQueries({ queryKey: queryKeys.events.past });
}

export function useCreateEventMutation(listRoute: Href = ROUTES.ADMIN.EVENTS as Href) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (values: EventFormValues) => {
      const { data, error } = await adminApi.createEvent(values);
      if (error) throw error;
      if (!data) throw new Error(t('events.admin.mutations.eventNotSaved'));
      return data;
    },
    onSuccess: (data) => {
      Alert.alert(t('events.admin.mutations.postedTitle'), t('events.admin.mutations.postedMessage', { title: data.title }));
      router.replace(listRoute);
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.events });
      refreshEventFeeds(queryClient);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : t('events.admin.mutations.couldNotCreateFallback');
      Alert.alert(t('events.admin.mutations.couldNotCreate'), message);
    },
  });
}

export function useUpdateEventMutation(id: string) {
  const queryClient = useQueryClient();
  const router = useRouter();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async (values: EventFormValues) => {
      const { data, error } = await adminApi.updateEvent(id, values);
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      Alert.alert(t('events.admin.mutations.savedTitle'), t('events.admin.mutations.savedMessage'));
      router.back();
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.events });
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.event(id) });
      void queryClient.invalidateQueries({ queryKey: queryKeys.events.detail(id) });
      refreshEventFeeds(queryClient);
    },
    onError: (error) => {
      const message =
        error instanceof Error ? error.message : t('events.admin.mutations.couldNotSaveFallback');
      Alert.alert(t('events.admin.mutations.couldNotSave'), message);
    },
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await adminApi.deleteEvent(id);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.events });
      refreshEventFeeds(queryClient);
    },
  });
}
