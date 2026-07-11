import i18n from '@/i18n';
import type { MentorshipSession } from '@/types/domain/mentorship';

const MS_24H = 24 * 60 * 60 * 1000;

export function isPendingSessionStatus(status: string): boolean {
  return status === 'pending' || status === 'proposed';
}

export function isActiveSessionStatus(status: string): boolean {
  return isPendingSessionStatus(status) || status === 'confirmed';
}

export function hoursUntilSession(scheduledStart: string): number {
  return (new Date(scheduledStart).getTime() - Date.now()) / (60 * 60 * 1000);
}

export function canStudentCancelSession(session: MentorshipSession): boolean {
  return session.status !== 'cancelled' && session.status !== 'completed';
}

export function canJoinGoogleMeet(session: MentorshipSession): boolean {
  if (!session.meetingUrl || !isActiveSessionStatus(session.status)) return false;
  return true;
}

export function studentCancelBlockedMessage(_session: MentorshipSession): string {
  return i18n.t('mentorship.session.cancelBlocked');
}
