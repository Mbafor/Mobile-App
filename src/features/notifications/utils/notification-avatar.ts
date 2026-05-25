import {
  MENTORSHIP_NOTIFICATION_TYPES,
  OPPORTUNITY_NOTIFICATION_TYPES,
  SYSTEM_NOTIFICATION_TYPES,
} from '@/features/notifications/constants/notification-types';
import type { AppNotification, NotificationAvatarKind } from '@/types/domain/notification';

export type NotificationAvatarSource = {
  kind: NotificationAvatarKind;
  imageUrl: string | null;
  displayName: string | null;
};

function metadataId(metadata: Record<string, unknown>, key: string): string | undefined {
  const value = metadata[key];
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}

export function resolveNotificationAvatarKind(notification: AppNotification): NotificationAvatarKind {
  if (OPPORTUNITY_NOTIFICATION_TYPES.includes(notification.type)) {
    return 'opportunity';
  }
  if (SYSTEM_NOTIFICATION_TYPES.includes(notification.type)) {
    return 'system';
  }
  if (MENTORSHIP_NOTIFICATION_TYPES.includes(notification.type)) {
    return 'user';
  }
  return 'system';
}

export function counterpartUserId(notification: AppNotification): string | undefined {
  const meta = notification.metadata;
  switch (notification.type) {
    case 'mentor_assigned':
      return metadataId(meta, 'mentor_id');
    case 'mentee_assigned':
      return metadataId(meta, 'student_id');
    case 'mentorship_message':
      return metadataId(meta, 'sender_id');
    default:
      return undefined;
  }
}

export function resolveAvatarSource(
  notification: AppNotification,
  context: {
    opportunityImages: Map<string, string | null>;
    profileAvatars: Map<string, { avatarUrl: string | null; fullName: string | null }>;
  },
): NotificationAvatarSource {
  const kind = resolveNotificationAvatarKind(notification);

  if (kind === 'opportunity' && notification.opportunityId) {
    return {
      kind,
      imageUrl: context.opportunityImages.get(notification.opportunityId) ?? null,
      displayName: null,
    };
  }

  if (kind === 'user') {
    const userId = counterpartUserId(notification);
    if (userId) {
      const profile = context.profileAvatars.get(userId);
      return {
        kind,
        imageUrl: profile?.avatarUrl ?? null,
        displayName: profile?.fullName ?? notification.title,
      };
    }
  }

  return { kind: 'system', imageUrl: null, displayName: null };
}
