/**
 * TanStack Query key factories — colocate feature keys in feature hooks when preferred.
 */
export const queryKeys = {
  auth: {
    session: ['auth', 'session'] as const,
    profile: (userId: string) => ['auth', 'profile', userId] as const,
    preferences: (userId: string) => ['auth', 'preferences', userId] as const,
  },
  opportunities: {
    all: ['opportunities'] as const,
    detail: (id: string) => ['opportunities', id] as const,
    saved: (userId: string) => ['opportunities', 'saved', userId] as const,
    tracker: (userId: string) => ['opportunities', 'tracker', userId] as const,
    applied: (userId: string, opportunityId: string) =>
      ['opportunities', 'applied', userId, opportunityId] as const,
  },
  notifications: {
    list: (userId: string) => ['notifications', 'list', userId] as const,
    unreadCount: (userId: string) => ['notifications', 'unread', userId] as const,
    preferences: (userId: string) => ['notifications', 'preferences', userId] as const,
  },
  dashboard: {
    summary: ['dashboard', 'summary'] as const,
  },
  superAdmin: {
    overview: ['superAdmin', 'overview'] as const,
    mentors: (search: string, status: string | null, page: number) =>
      ['superAdmin', 'mentors', search, status, page] as const,
    mentees: (search: string, page: number) => ['superAdmin', 'mentees', search, page] as const,
    admins: (search: string, page: number) => ['superAdmin', 'admins', search, page] as const,
  },
  admin: {
    stats: ['admin', 'stats'] as const,
    analytics: ['admin', 'analytics'] as const,
    opportunities: ['admin', 'opportunities'] as const,
    pendingOpportunities: ['admin', 'pending'] as const,
    opportunity: (id: string) => ['admin', 'opportunity', id] as const,
  },
  cv: {
    list: (userId: string) => ['cv', 'list', userId] as const,
    detail: (cvId: string) => ['cv', 'detail', cvId] as const,
    payments: (userId: string) => ['cv', 'payments', userId] as const,
  },
  mentorship: {
    role: (userId: string) => ['mentorship', 'role', userId] as const,
    active: (userId: string) => ['mentorship', 'active', userId] as const,
    openRequest: (userId: string) => ['mentorship', 'openRequest', userId] as const,
    waiting: (userId: string) => ['mentorship', 'waiting', userId] as const,
    list: (userId: string) => ['mentorship', 'list', userId] as const,
    mentees: (mentorId: string) => ['mentorship', 'mentees', mentorId] as const,
    mentorCapacity: (mentorId: string) => ['mentorship', 'capacity', mentorId] as const,
    coachProfile: (mentorId: string) => ['mentorship', 'coachProfile', mentorId] as const,
    myMentorProfile: (userId: string) => ['mentorship', 'myMentorProfile', userId] as const,
    messages: (mentorshipId: string) => ['mentorship', 'messages', mentorshipId] as const,
    messagePreview: (mentorshipId: string) =>
      ['mentorship', 'messagePreview', mentorshipId] as const,
    sessions: (userId: string) => ['mentorship', 'sessions', userId] as const,
    availability: (mentorId: string) => ['mentorship', 'availability', mentorId] as const,
    availabilitySlots: (coachId: string) => ['mentorship', 'availabilitySlots', coachId] as const,
  },
} as const;
