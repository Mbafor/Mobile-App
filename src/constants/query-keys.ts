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
  admin: {
    stats: ['admin', 'stats'] as const,
    analytics: ['admin', 'analytics'] as const,
    opportunities: ['admin', 'opportunities'] as const,
    opportunity: (id: string) => ['admin', 'opportunity', id] as const,
  },
  cv: {
    list: (userId: string) => ['cv', 'list', userId] as const,
    detail: (cvId: string) => ['cv', 'detail', cvId] as const,
    payments: (userId: string) => ['cv', 'payments', userId] as const,
  },
} as const;
