import type {
  AvailabilitySlot,
  MentorAvailabilityRule,
  MentorProfile,
  MentorshipMessage,
  MentorshipParticipantProfile,
  MentorshipSession,
} from '@/types/domain/mentorship';

type MentorProfileRow = {
  user_id: string;
  status: string;
  bio: string | null;
  mentoring_majors: string[];
  mentoring_interests: string[];
  mentoring_career_areas: string[];
  mentoring_degree_levels: string[];
  max_students: number;
  is_accepting_students: boolean;
};

type ProfileRow = {
  id: string;
  full_name: string | null;
  email: string | null;
  avatar_url: string | null;
  country: string | null;
  university: string | null;
  course_major: string | null;
  degree_level: string | null;
  interests: string[];
  career_interests: string[];
  bio?: string | null;
};

type AvailabilityRow = {
  id: string;
  mentor_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
  is_active: boolean;
};

type AvailabilitySlotRow = {
  id: string;
  coach_id: string;
  day_of_week: number;
  start_time: string;
  end_time: string;
  timezone: string;
};

type SessionRow = {
  id: string;
  mentorship_id: string;
  created_by: string;
  student_id?: string | null;
  coach_id?: string | null;
  scheduled_start: string;
  scheduled_end: string;
  timezone: string;
  status: string;
  title: string | null;
  notes: string | null;
  meeting_url: string | null;
  joined_at?: string | null;
  ended_at?: string | null;
  cancelled_at: string | null;
  cancel_reason: string | null;
};

type MessageRow = {
  id: string;
  mentorship_id: string;
  sender_id: string;
  body: string;
  attachment_url: string | null;
  attachment_type: string | null;
  created_at: string;
};

export function mapMentorProfileRow(row: MentorProfileRow): MentorProfile {
  return {
    userId: row.user_id,
    status: row.status as MentorProfile['status'],
    bio: row.bio,
    mentoringMajors: row.mentoring_majors ?? [],
    mentoringInterests: row.mentoring_interests ?? [],
    mentoringCareerAreas: row.mentoring_career_areas ?? [],
    mentoringDegreeLevels: row.mentoring_degree_levels ?? [],
    maxStudents: row.max_students,
    isAcceptingStudents: row.is_accepting_students,
  };
}

export function mapParticipantProfileRow(row: ProfileRow): MentorshipParticipantProfile {
  return {
    id: row.id,
    fullName: row.full_name,
    email: row.email,
    avatarUrl: row.avatar_url,
    country: row.country,
    university: row.university,
    courseMajor: row.course_major,
    degreeLevel: row.degree_level,
    interests: row.interests ?? [],
    careerInterests: row.career_interests ?? [],
    bio: row.bio ?? null,
  };
}

export function mapAvailabilitySlotRow(row: AvailabilitySlotRow): AvailabilitySlot {
  return {
    id: row.id,
    coachId: row.coach_id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone,
  };
}

export function mapAvailabilityRow(row: AvailabilityRow): MentorAvailabilityRule {
  return {
    id: row.id,
    mentorId: row.mentor_id,
    dayOfWeek: row.day_of_week,
    startTime: row.start_time,
    endTime: row.end_time,
    timezone: row.timezone,
    isActive: row.is_active,
  };
}

export function mapSessionRow(row: SessionRow): MentorshipSession {
  return {
    id: row.id,
    mentorshipId: row.mentorship_id,
    createdBy: row.created_by,
    studentId: row.student_id ?? null,
    coachId: row.coach_id ?? null,
    scheduledStart: row.scheduled_start,
    scheduledEnd: row.scheduled_end,
    timezone: row.timezone,
    status: row.status as MentorshipSession['status'],
    title: row.title,
    notes: row.notes,
    meetingUrl: row.meeting_url,
    joinedAt: row.joined_at ?? null,
    endedAt: row.ended_at ?? null,
    cancelledAt: row.cancelled_at,
    cancelReason: row.cancel_reason,
  };
}

export function mapMessageRow(row: MessageRow): MentorshipMessage {
  const attachmentType =
    row.attachment_type === 'image' || row.attachment_type === 'file'
      ? row.attachment_type
      : null;
  return {
    id: row.id,
    mentorshipId: row.mentorship_id,
    senderId: row.sender_id,
    body: row.body,
    attachmentUrl: row.attachment_url,
    attachmentType,
    createdAt: row.created_at,
  };
}
