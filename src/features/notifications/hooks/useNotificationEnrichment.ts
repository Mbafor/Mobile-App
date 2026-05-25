import { useQuery } from '@tanstack/react-query';

import { counterpartUserId } from '@/features/notifications/utils/notification-avatar';
import { queryKeys } from '@/constants/query-keys';
import { supabase } from '@/services/supabase/client';
import type { AppNotification } from '@/types/domain/notification';

export type NotificationEnrichment = {
  opportunityImages: Map<string, string | null>;
  profileAvatars: Map<string, { avatarUrl: string | null; fullName: string | null }>;
};

async function fetchEnrichment(
  notifications: AppNotification[],
): Promise<NotificationEnrichment> {
  const opportunityIds = [
    ...new Set(
      notifications
        .map((n) => n.opportunityId)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const profileIds = [
    ...new Set(
      notifications
        .map((n) => counterpartUserId(n))
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const opportunityImages = new Map<string, string | null>();
  const profileAvatars = new Map<
    string,
    { avatarUrl: string | null; fullName: string | null }
  >();

  if (opportunityIds.length > 0) {
    const { data } = await supabase
      .from('opportunities')
      .select('id, image_url')
      .in('id', opportunityIds);

    for (const row of data ?? []) {
      opportunityImages.set(row.id, row.image_url);
    }
  }

  if (profileIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('id, avatar_url, full_name')
      .in('id', profileIds);

    for (const row of data ?? []) {
      profileAvatars.set(row.id, {
        avatarUrl: row.avatar_url,
        fullName: row.full_name,
      });
    }
  }

  return { opportunityImages, profileAvatars };
}

export function useNotificationEnrichment(notifications: AppNotification[]) {
  const signature = notifications
    .map((n) => `${n.id}:${n.opportunityId ?? ''}:${counterpartUserId(n) ?? ''}`)
    .join('|');

  return useQuery({
    queryKey: [...queryKeys.notifications.list('enrichment'), signature],
    queryFn: () => fetchEnrichment(notifications),
    enabled: notifications.length > 0,
    staleTime: 60_000,
  });
}
