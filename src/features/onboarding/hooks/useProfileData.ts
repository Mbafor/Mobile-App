import { useQuery } from '@tanstack/react-query';

import { useAuth } from '@/features/auth/hooks/useAuth';
import { queryKeys } from '@/constants/query-keys';
import { profilesApi, userPreferencesApi } from '@/services/api';

export function useProfileData() {
  const { user } = useAuth();
  const userId = user?.id;

  const profileQuery = useQuery({
    queryKey: queryKeys.auth.profile(userId ?? ''),
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await profilesApi.getByUserId(userId);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(userId),
  });

  const preferencesQuery = useQuery({
    queryKey: queryKeys.auth.preferences(userId ?? ''),
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await userPreferencesApi.getByUserId(userId);
      if (error) throw error;
      return data;
    },
    enabled: Boolean(userId),
  });

  return {
    profile: profileQuery.data ?? null,
    preferences: preferencesQuery.data ?? null,
    isLoading: profileQuery.isLoading || preferencesQuery.isLoading,
    refetch: async () => {
      await Promise.all([profileQuery.refetch(), preferencesQuery.refetch()]);
    },
  };
}
