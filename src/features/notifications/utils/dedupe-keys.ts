import type { NotificationType } from '@/types/domain/notification';

function dayKey(iso: string): string {
  const d = new Date(iso);
  return `${d.getUTCFullYear()}-${d.getUTCMonth() + 1}-${d.getUTCDate()}`;
}

export function buildDedupeKey(
  type: NotificationType,
  opportunityId: string,
  deadlineIso?: string,
): string {
  switch (type) {
    case 'new_match':
      return `new_match:${opportunityId}`;
    case 'deadline_reminder':
      return `deadline_3d:${opportunityId}:${dayKey(deadlineIso ?? '')}`;
    case 'saved_reminder':
      return `saved_1d:${opportunityId}:${dayKey(deadlineIso ?? '')}`;
    default:
      return `${type}:${opportunityId}`;
  }
}
