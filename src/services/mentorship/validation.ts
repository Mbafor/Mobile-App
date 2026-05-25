import type { MentorshipStatus } from '@/types/domain/mentorship';

const END_STATUSES: MentorshipStatus[] = [
  'left_by_student',
  'removed_by_mentor',
  'ended',
];

export function validateMentorshipId(id: string | undefined | null): string | null {
  if (!id?.trim()) return 'Mentorship id is required.';
  return null;
}

export function validateRequestId(id: string | undefined | null): string | null {
  if (!id?.trim()) return 'Request id is required.';
  return null;
}

export function validateEndReason(reason: string | undefined): string | null {
  if (reason && reason.trim().length > 500) {
    return 'Reason must be 500 characters or fewer.';
  }
  return null;
}

export function validateEndStatus(status: string): status is MentorshipStatus {
  return END_STATUSES.includes(status as MentorshipStatus);
}

export function validateRequestedMentorId(
  mentorId: string | undefined | null,
): string | null {
  if (mentorId === undefined || mentorId === null || mentorId === '') return null;
  if (!mentorId.trim()) return 'Invalid mentor id.';
  return null;
}
