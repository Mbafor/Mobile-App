import {
  mapMentorProfileRow,
  mapParticipantProfileRow,
} from '@/services/api/mappers/mentorship-extended.mapper';
import type {
  AvailableMentor,
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

function coerceStringArray(value: unknown): string[] {
  if (Array.isArray(value)) {
    return value.filter((v): v is string => typeof v === 'string');
  }
  return [];
}

export function parseAvailableMentors(data: unknown): AvailableMentor[] {
  const items = Array.isArray(data) ? data : [];

  return items
    .map((item): AvailableMentor | null => {
      const row = asRecord(item);
      if (!row || typeof row.mentor_user_id !== 'string') return null;

      const profileRow = asRecord(row.profile);
      const mentorRow = asRecord(row.mentor_profile);
      if (!mentorRow) return null;

      const mentorUserId = row.mentor_user_id;

      return {
        mentorUserId,
        matchScore: Number(row.match_score ?? 0),
        activeMenteeCount: Number(row.active_mentee_count ?? 0),
        maxStudents: Number(row.max_students ?? mentorRow.max_students ?? 10),
        hasCapacity: Boolean(row.has_capacity),
        isAcceptingStudents: Boolean(row.is_accepting_students ?? true),
        profile: mapParticipantProfileRow({
          id: String(profileRow?.id ?? mentorUserId),
          full_name: (profileRow?.full_name as string | null) ?? null,
          email: (profileRow?.email as string | null) ?? null,
          avatar_url: (profileRow?.avatar_url as string | null) ?? null,
          country: (profileRow?.country as string | null) ?? null,
          university: (profileRow?.university as string | null) ?? null,
          course_major: (profileRow?.course_major as string | null) ?? null,
          degree_level: (profileRow?.degree_level as string | null) ?? null,
          interests: coerceStringArray(profileRow?.interests),
          career_interests: coerceStringArray(profileRow?.career_interests),
          bio: (profileRow?.bio as string | null) ?? null,
        }),
        mentor: mapMentorProfileRow({
          user_id: String(mentorRow.user_id ?? mentorUserId),
          status: (mentorRow.status as 'approved') ?? 'approved',
          bio: mentorRow.bio as string | null,
          mentoring_majors: coerceStringArray(mentorRow.mentoring_majors),
          mentoring_interests: coerceStringArray(mentorRow.mentoring_interests),
          mentoring_career_areas: coerceStringArray(mentorRow.mentoring_career_areas),
          mentoring_degree_levels: coerceStringArray(mentorRow.mentoring_degree_levels),
          max_students: Number(mentorRow.max_students ?? 10),
          is_accepting_students: Boolean(mentorRow.is_accepting_students ?? true),
        }),
      };
    })
    .filter((m): m is AvailableMentor => m !== null);
}

export function parseMaintenanceResult(data: unknown): MentorshipMaintenanceResult | null {
  const row = asRecord(data);
  if (!row) return null;
  return {
    expired: Number(row.expired ?? 0),
    assigned: Number(row.assigned ?? 0),
  };
}
