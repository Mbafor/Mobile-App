import { countMatchingTags } from '@/features/opportunities/utils/recommendations';
import {
  DEADLINE_REMINDER_DAYS,
  SAVED_REMINDER_DAYS,
} from '@/features/notifications/constants/notification-types';
import type { CreateNotificationInput } from '@/services/api/notifications.api';
import { buildDedupeKey } from '@/features/notifications/utils/dedupe-keys';
import type { NotificationType } from '@/types/domain/notification';
import type { Opportunity } from '@/types/domain/opportunity';
import { calendarDaysUntilDeadline } from '@/utils/formatting/deadline';

function isActive(opportunity: Opportunity): boolean {
  return new Date(opportunity.deadline).getTime() > Date.now();
}

function buildPayload(
  userId: string,
  type: NotificationType,
  opportunity: Opportunity,
  title: string,
  body: string,
): CreateNotificationInput {
  return {
    userId,
    type,
    title,
    body,
    opportunityId: opportunity.id,
    dedupeKey: buildDedupeKey(type, opportunity.id, opportunity.deadline),
  };
}

export function buildNewMatchCandidates(
  userId: string,
  opportunities: Opportunity[],
  interests: string[],
  opportunityTypes: string[],
  lastMatchSyncAt: string | null,
): CreateNotificationInput[] {
  const keywords = [...interests, ...opportunityTypes];
  const since = lastMatchSyncAt ? new Date(lastMatchSyncAt).getTime() : 0;

  return opportunities
    .filter(isActive)
    .filter((o) => new Date(o.createdAt).getTime() > since)
    .filter((o) => countMatchingTags(o, keywords) > 0)
    .map((o) =>
      buildPayload(
        userId,
        'new_match',
        o,
        'New opportunity for you',
        `${o.title} matches your interests.`,
      ),
    );
}

export function buildDeadlineReminderCandidates(
  userId: string,
  opportunities: Opportunity[],
): CreateNotificationInput[] {
  return opportunities
    .filter(isActive)
    .filter((o) => calendarDaysUntilDeadline(o.deadline) === DEADLINE_REMINDER_DAYS)
    .map((o) =>
      buildPayload(
        userId,
        'deadline_reminder',
        o,
        'Deadline in 3 days',
        `${o.title} closes on ${new Date(o.deadline).toLocaleDateString()}.`,
      ),
    );
}

export function buildSavedReminderCandidates(
  userId: string,
  opportunities: Opportunity[],
  savedIds: Set<string>,
): CreateNotificationInput[] {
  return opportunities
    .filter(isActive)
    .filter((o) => savedIds.has(o.id))
    .filter((o) => calendarDaysUntilDeadline(o.deadline) === SAVED_REMINDER_DAYS)
    .map((o) =>
      buildPayload(
        userId,
        'saved_reminder',
        o,
        'Saved opportunity closing soon',
        `${o.title} deadline is tomorrow.`,
      ),
    );
}

export type NotificationSyncContext = {
  userId: string;
  opportunities: Opportunity[];
  savedIds: string[];
  interests: string[];
  opportunityTypes: string[];
  lastMatchSyncAt: string | null;
  prefs: {
    newMatches: boolean;
    deadlineReminders: boolean;
    savedReminders: boolean;
  };
};

export function buildSyncCandidates(ctx: NotificationSyncContext): CreateNotificationInput[] {
  const savedSet = new Set(ctx.savedIds);
  const items: CreateNotificationInput[] = [];

  if (ctx.prefs.newMatches) {
    items.push(
      ...buildNewMatchCandidates(
        ctx.userId,
        ctx.opportunities,
        ctx.interests,
        ctx.opportunityTypes,
        ctx.lastMatchSyncAt,
      ),
    );
  }

  if (ctx.prefs.deadlineReminders) {
    items.push(...buildDeadlineReminderCandidates(ctx.userId, ctx.opportunities));
  }

  if (ctx.prefs.savedReminders) {
    items.push(...buildSavedReminderCandidates(ctx.userId, ctx.opportunities, savedSet));
  }

  return items;
}
