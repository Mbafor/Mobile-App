import type {
  CancelRequestResult,
  EndMentorshipResult,
  MentorshipMaintenanceResult,
  MentorshipStatus,
  RequestCoachResult,
} from '@/types/domain/mentorship';

function asRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null;
  return value as Record<string, unknown>;
}

export function parseRequestCoachResult(data: unknown): RequestCoachResult | null {
  const row = asRecord(data);
  if (!row || typeof row.outcome !== 'string') return null;

  if (row.outcome === 'matched') {
    if (
      typeof row.request_id !== 'string' ||
      typeof row.mentorship_id !== 'string' ||
      typeof row.mentor_id !== 'string'
    ) {
      return null;
    }
    return {
      outcome: 'matched',
      requestId: row.request_id,
      mentorshipId: row.mentorship_id,
      mentorId: row.mentor_id,
      matchScore: Number(row.match_score ?? 0),
    };
  }

  if (row.outcome === 'waiting_list' && typeof row.request_id === 'string') {
    return {
      outcome: 'waiting_list',
      requestId: row.request_id,
      queuePosition: Number(row.queue_position ?? 0),
    };
  }

  return null;
}

export function parseEndMentorshipResult(data: unknown): EndMentorshipResult | null {
  const row = asRecord(data);
  if (!row || row.outcome !== 'ended' || typeof row.mentorship_id !== 'string') {
    return null;
  }
  return {
    outcome: 'ended',
    mentorshipId: row.mentorship_id,
    status: row.status as MentorshipStatus,
    queueAssigned: Number(row.queue_assigned ?? 0),
  };
}

export function parseCancelRequestResult(data: unknown): CancelRequestResult | null {
  const row = asRecord(data);
  if (!row || row.outcome !== 'cancelled' || typeof row.request_id !== 'string') {
    return null;
  }
  return { outcome: 'cancelled', requestId: row.request_id };
}

export function parseMaintenanceResult(data: unknown): MentorshipMaintenanceResult | null {
  const row = asRecord(data);
  if (!row) return null;
  return {
    expired: Number(row.expired ?? 0),
    assigned: Number(row.assigned ?? 0),
  };
}
