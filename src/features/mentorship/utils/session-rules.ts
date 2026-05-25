import type { MentorshipSession } from '@/types/domain/mentorship';

const MS_24H = 24 * 60 * 60 * 1000;
const MS_15M = 15 * 60 * 1000;

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
  if (!isActiveSessionStatus(session.status)) return false;
  return hoursUntilSession(session.scheduledStart) >= 24;
}

export function canJoinGoogleMeet(session: MentorshipSession): boolean {
  if (!session.meetingUrl || !isActiveSessionStatus(session.status)) return false;
  const start = new Date(session.scheduledStart).getTime();
  const end = new Date(session.scheduledEnd).getTime();
  const now = Date.now();
  return now >= start - MS_15M && now <= end + MS_15M;
}

export function studentCancelBlockedMessage(session: MentorshipSession): string {
  const hours = hoursUntilSession(session.scheduledStart);
  if (hours < 24) {
    return 'You can only cancel sessions at least 24 hours before the start time.';
  }
  return 'This session cannot be cancelled.';
}
