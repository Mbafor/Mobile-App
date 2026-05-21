import type { NotificationType } from '@/types/domain/notification';

export const NOTIFICATION_TYPE_LABELS: Record<NotificationType, string> = {
  new_match: 'New match',
  deadline_reminder: 'Deadline reminder',
  saved_reminder: 'Saved reminder',
};

export const DEADLINE_REMINDER_DAYS = 3;
export const SAVED_REMINDER_DAYS = 1;
