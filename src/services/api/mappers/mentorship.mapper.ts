import type {
  Mentorship,
  MentorshipMatchSnapshot,
  MentorshipRequest,
} from '@/types/domain/mentorship';

type MentorshipRequestRow = {
  id: string;
  student_id: string;
  status: string;
  requested_mentor_id: string | null;
  match_snapshot: unknown;
  match_score: number | null;
  matched_mentor_id: string | null;
  matched_at: string | null;
  mentorship_id: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
  created_at: string;
  updated_at: string;
};

type MentorshipRow = {
  id: string;
  mentor_id: string;
  student_id: string;
  request_id: string | null;
  status: string;
  started_at: string;
  ends_at: string;
  ended_at: string | null;
  end_reason: string | null;
  created_at: string;
  updated_at: string;
};

function parseMatchSnapshot(raw: unknown): MentorshipMatchSnapshot {
  const row = raw && typeof raw === 'object' && !Array.isArray(raw)
    ? (raw as Record<string, unknown>)
    : {};

  const interests = Array.isArray(row.interests)
    ? row.interests.filter((v): v is string => typeof v === 'string')
    : [];
  const careerInterests = Array.isArray(row.career_interests)
    ? row.career_interests.filter((v): v is string => typeof v === 'string')
    : [];

  return {
    course_major: typeof row.course_major === 'string' ? row.course_major : null,
    degree_level: typeof row.degree_level === 'string' ? row.degree_level : null,
    interests,
    career_interests: careerInterests,
    university: typeof row.university === 'string' ? row.university : null,
  };
}

export function mapMentorshipRequestRow(row: MentorshipRequestRow): MentorshipRequest {
  return {
    id: row.id,
    studentId: row.student_id,
    status: row.status as MentorshipRequest['status'],
    requestedMentorId: row.requested_mentor_id,
    matchSnapshot: parseMatchSnapshot(row.match_snapshot),
    matchScore: row.match_score,
    matchedMentorId: row.matched_mentor_id,
    matchedAt: row.matched_at,
    mentorshipId: row.mentorship_id,
    cancelledAt: row.cancelled_at,
    cancelReason: row.cancel_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function mapMentorshipRow(row: MentorshipRow): Mentorship {
  return {
    id: row.id,
    mentorId: row.mentor_id,
    studentId: row.student_id,
    requestId: row.request_id,
    status: row.status as Mentorship['status'],
    startedAt: row.started_at,
    endsAt: row.ends_at,
    endedAt: row.ended_at,
    endReason: row.end_reason,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}
