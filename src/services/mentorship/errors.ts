import type { ApiError } from '@/types/api';

const MENTORSHIP_ERROR_MESSAGES: Record<string, string> = {
  P0001: 'Complete onboarding before requesting a coach.',
  P0002: 'You already have an active mentorship.',
  P0003: 'You already have a pending mentorship request.',
  P0004: 'Mentorship not found.',
  P0005: 'You are not allowed to perform this action.',
  P0006: 'This mentorship is no longer active.',
  P0007: 'This coach has no available slots.',
  P0008: 'This coach is not a compatible match.',
  P0009: 'Profile not found. Please complete your profile.',
  P0010: 'The requested coach is not available.',
  P0011: 'No open mentorship request found.',
  P0012: 'This request can no longer be cancelled.',
  P0013: 'Invalid mentorship end status.',
  '42501': 'You must be signed in.',
  '23514': 'This coach has reached their maximum number of students.',
  '23505': 'You already have a pending session this week, or this time slot is already booked.',
  '22023': "The selected time is not within your coach's available hours.",
};

export function mapMentorshipError(error: { message: string; code?: string }): ApiError {
  const code = error.code ?? 'unknown';
  const message =
    MENTORSHIP_ERROR_MESSAGES[code] ??
    (error.message.includes('maximum active students')
      ? MENTORSHIP_ERROR_MESSAGES['23514']
      : error.message);

  return { code, message };
}

export function mentorshipErrorFromUnknown(e: unknown): ApiError {
  if (e && typeof e === 'object' && 'message' in e) {
    return mapMentorshipError(e as { message: string; code?: string });
  }
  return { code: 'unknown', message: 'Something went wrong. Please try again.' };
}
