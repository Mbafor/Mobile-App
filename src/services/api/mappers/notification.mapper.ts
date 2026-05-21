import type {
  NotificationPreferencesRow,
  NotificationRow,
} from '@/services/supabase/types';
import type { AppNotification, NotificationPreferences } from '@/types/domain/notification';

export function mapNotificationRow(row: NotificationRow): AppNotification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    body: row.body,
    opportunityId: row.opportunity_id,
    dedupeKey: row.dedupe_key,
    readAt: row.read_at,
    pushSentAt: row.push_sent_at,
    createdAt: row.created_at,
  };
}

export function mapNotificationPreferencesRow(
  row: NotificationPreferencesRow,
): NotificationPreferences {
  return {
    userId: row.user_id,
    pushEnabled: row.push_enabled,
    newMatches: row.new_matches,
    deadlineReminders: row.deadline_reminders,
    savedReminders: row.saved_reminders,
    lastMatchSyncAt: row.last_match_sync_at,
    updatedAt: row.updated_at,
  };
}
