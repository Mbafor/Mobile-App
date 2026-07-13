import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Alert } from 'react-native';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/constants/query-keys';
import { useCanManageOpportunities } from '@/features/admin/hooks/useCanManageOpportunities';
import { weeklyDigestApi } from '@/services/api';

export function useWeeklyDigestCandidates() {
  const { isReady } = useCanManageOpportunities();

  return useQuery({
    queryKey: queryKeys.admin.weeklyDigestCandidates,
    queryFn: async () => {
      const { data, error } = await weeklyDigestApi.listCandidates();
      if (error) throw error;
      return data ?? [];
    },
    enabled: isReady,
  });
}

export function usePublishDigestMutation() {
  const queryClient = useQueryClient();
  const { t } = useTranslation();

  return useMutation({
    mutationFn: async ({
      opportunityIds,
      channel,
      slug,
    }: {
      opportunityIds: string[];
      channel: string;
      slug: string;
    }) => {
      const { error } = await weeklyDigestApi.publishDigest(opportunityIds, channel, slug);
      if (error) throw error;
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.admin.weeklyDigestCandidates });
    },
    onError: (error) => {
      Alert.alert(
        t('admin.weeklyDigest.errors.publishFailedTitle'),
        error instanceof Error ? error.message : t('admin.mutations.tryAgain'),
      );
    },
  });
}
