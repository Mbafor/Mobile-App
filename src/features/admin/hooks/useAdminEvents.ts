import { useQuery } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';

import { queryKeys } from '@/constants/query-keys';
import { useCanManageEvents } from '@/features/admin/hooks/useCanManageEvents';
import { adminApi } from '@/services/api';

export function useAdminEvents() {
  const { isReady } = useCanManageEvents();

  return useQuery({
    queryKey: queryKeys.admin.events,
    queryFn: async () => {
      const { data, error } = await adminApi.listEvents();
      if (error) throw error;
      return data ?? [];
    },
    enabled: isReady,
  });
}

export function useAdminEvent(id: string | undefined) {
  const { isReady } = useCanManageEvents();
  const { t } = useTranslation();

  return useQuery({
    queryKey: queryKeys.admin.event(id ?? ''),
    queryFn: async () => {
      if (!id) throw new Error(t('events.admin.errors.missingEventId'));
      const { data, error } = await adminApi.getEvent(id);
      if (error) throw error;
      if (!data) throw new Error(t('events.admin.errors.eventNotFound'));
      return data;
    },
    enabled: isReady && Boolean(id),
  });
}
