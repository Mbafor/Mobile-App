import type { Router } from 'expo-router';

import { ROUTES } from '@/constants/routes';
import type { AppNotification } from '@/types/domain/notification';

function metadataString(
  metadata: Record<string, unknown>,
  key: string,
): string | undefined {
  const value = metadata[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

/** Navigate to the best destination for a notification tap or push open. */
export function navigateFromNotification(router: Router, notification: AppNotification): void {
  if (notification.opportunityId) {
    router.push({
      pathname: '/(main)/opportunity/[id]',
      params: { id: notification.opportunityId },
    });
    return;
  }

  const meta = notification.metadata;

  switch (notification.type) {
    case 'mentor_assigned':
    case 'mentee_assigned':
    case 'waiting_list_update':
    case 'session_reminder':
    case 'session_booked':
    case 'mentorship_message':
      router.push(ROUTES.MAIN.MENTORSHIP);
      return;
    case 'mentor_broadcast':
      router.push(ROUTES.MAIN.NOTIFICATIONS);
      return;
    default: {
      const opportunityId = metadataString(meta, 'opportunity_id');
      if (opportunityId) {
        router.push({
          pathname: '/(main)/opportunity/[id]',
          params: { id: opportunityId },
        });
        return;
      }
      router.push(ROUTES.MAIN.NOTIFICATIONS);
    }
  }
}

/** Resolve push notification payload into navigation (may lack full AppNotification). */
export function navigateFromPushData(
  router: Router,
  data: Record<string, unknown>,
): void {
  const opportunityId =
    typeof data.opportunityId === 'string'
      ? data.opportunityId
      : typeof data.opportunity_id === 'string'
        ? data.opportunity_id
        : undefined;

  if (opportunityId) {
    router.push({
      pathname: '/(main)/opportunity/[id]',
      params: { id: opportunityId },
    });
    return;
  }

  const type = typeof data.type === 'string' ? data.type : '';
  if (
    type === 'mentor_assigned' ||
    type === 'mentee_assigned' ||
    type === 'waiting_list_update' ||
    type === 'session_reminder' ||
    type === 'session_booked' ||
    type === 'mentorship_message'
  ) {
    router.push(ROUTES.MAIN.MENTORSHIP);
    return;
  }

  router.push(ROUTES.MAIN.NOTIFICATIONS);
}
