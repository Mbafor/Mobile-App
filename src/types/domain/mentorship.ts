export type MentorshipRequestStatus = 'pending' | 'waiting_list' | 'matched' | 'cancelled';

export type MentorshipStatus =
  | 'active'
  | 'ended'
  | 'expired'
  | 'removed_by_mentor'
  | 'left_by_student';

export type MentorshipRequestOutcome = 'matched' | 'waiting_list' | 'cancelled';

export type MentorshipMatchSnapshot = {
  course_major: string | null;
  degree_level: string | null;
  interests: string[];
  career_interests: string[];
  university: string | null;
};

export type MentorshipRequest = {
  id: string;
  studentId: string;
  status: MentorshipRequestStatus;
  requestedMentorId: string | null;
  matchSnapshot: MentorshipMatchSnapshot;
  matchScore: number | null;
  matchedMentorId: string | null;
  matchedAt: string | null;
  mentorshipId: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type Mentorship = {
  id: string;
  mentorId: string;
  studentId: string;
  requestId: string | null;
  status: MentorshipStatus;
  startedAt: string;
  endsAt: string;
  endedAt: string | null;
  endReason: string | null;
  createdAt: string;
  updatedAt: string;
};

export type RequestCoachResult =
  | {
      outcome: 'matched';
      requestId: string;
      mentorshipId: string;
      mentorId: string;
      matchScore: number;
    }
  | {
      outcome: 'waiting_list';
      requestId: string;
      queuePosition: number;
    };

export type EndMentorshipResult = {
  outcome: 'ended';
  mentorshipId: string;
  status: MentorshipStatus;
  queueAssigned: number;
};

export type CancelRequestResult = {
  outcome: 'cancelled';
  requestId: string;
};

export type MentorshipMaintenanceResult = {
  expired: number;
  assigned: number;
};

export type MentorProfileStatus = 'pending' | 'approved' | 'rejected' | 'suspended';

export type MentorProfile = {
  userId: string;
  status: MentorProfileStatus;
  bio: string | null;
  mentoringMajors: string[];
  mentoringInterests: string[];
  mentoringCareerAreas: string[];
  mentoringDegreeLevels: string[];
  maxStudents: number;
  isAcceptingStudents: boolean;
};

export type MentorshipParticipantProfile = {
  id: string;
  fullName: string | null;
  email: string | null;
  avatarUrl: string | null;
  country: string | null;
  university: string | null;
  courseMajor: string | null;
  degreeLevel: string | null;
  interests: string[];
  careerInterests: string[];
};

export type MenteeSummary = {
  mentorship: Mentorship;
  profile: MentorshipParticipantProfile;
  progressPercent: number;
};

/** Mentor row for student browse / choose-coach flow. */
export type AvailableMentor = {
  mentorUserId: string;
  matchScore: number;
  activeMenteeCount: number;
  maxStudents: number;
  hasCapacity: boolean;
  isAcceptingStudents: boolean;
  profile: MentorshipParticipantProfile;
  mentor: MentorProfile;
};

export type WaitingListStatus = {
  requestId: string;
  position: number;
  totalInQueue: number;
  estimatedWaitLabel: string;
  enteredAt: string;
};

export type MentorAvailabilityRule = {
  id: string;
  mentorId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
  isActive: boolean;
};

/** Granular weekly slot (maps to availability_slots.coach_id). */
export type AvailabilitySlot = {
  id: string;
  coachId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  timezone: string;
};

export type MentorshipSessionStatus =
  | 'pending'
  | 'proposed'
  | 'confirmed'
  | 'completed'
  | 'cancelled';

export type MentorshipSession = {
  id: string;
  mentorshipId: string;
  createdBy: string;
  studentId: string | null;
  coachId: string | null;
  scheduledStart: string;
  scheduledEnd: string;
  timezone: string;
  status: MentorshipSessionStatus;
  title: string | null;
  notes: string | null;
  meetingUrl: string | null;
  joinedAt: string | null;
  endedAt: string | null;
  cancelledAt: string | null;
  cancelReason: string | null;
};

export type MentorshipMessageAttachmentType = 'image' | 'file';

export type MentorshipMessage = {
  id: string;
  mentorshipId: string;
  senderId: string;
  body: string;
  attachmentUrl: string | null;
  attachmentType: MentorshipMessageAttachmentType | null;
  createdAt: string;
};

export type MentorshipSectionId =
  | 'dashboard'
  | 'coach'
  | 'messages'
  | 'book'
  | 'sessions'
  | 'availability'
  | 'notifications'
  | 'leave';

export type CoachMentorshipSectionId =
  | 'dashboard'
  | 'messages'
  | 'availability'
  | 'sessions'
  | 'notifications';
