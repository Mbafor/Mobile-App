import type {
  NotificationPreferencesRow,
  NotificationRow,
} from '@/services/supabase/types';
import type { AppNotification, NotificationPreferences } from '@/types/domain/notification';

export function mapNotificationRow(row: NotificationRow): AppNotification {
  const meta = row.metadata;
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type as AppNotification['type'],
    title: row.title,
    body: row.body,
    opportunityId: row.opportunity_id,
    metadata:
      meta && typeof meta === 'object' && !Array.isArray(meta)
        ? (meta as Record<string, unknown>)
        : {},
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
    mentorshipAssignments: row.mentorship_assignments ?? true,
    waitingListUpdates: row.waiting_list_updates ?? true,
    sessionReminders: row.session_reminders ?? true,
    mentorshipMessages: row.mentorship_messages ?? true,
    lastMatchSyncAt: row.last_match_sync_at,
    updatedAt: row.updated_at,
  };
}
