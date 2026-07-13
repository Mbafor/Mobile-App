/**
 * Typed route hrefs for Expo Router — single source of truth for navigation.
 */
export const ROUTES = {
  ROOT: '/',
  AUTH: {
    WELCOME: '/(auth)/welcome',
    EMAIL: '/(auth)/email',
    VERIFY_OTP: '/(auth)/verify-otp',
    RESET_PASSWORD: '/(auth)/reset-password',
  },
  ONBOARDING: {
    BASIC_INFO: '/(onboarding)/basic-information',
    ACADEMIC: '/(onboarding)/academic-information',
    PREFERENCES: '/(onboarding)/opportunity-preferences',
  },
  MAIN: {
    DASHBOARD: '/(main)/(tabs)/dashboard',
    MENTORSHIP: '/(main)/(tabs)/mentorship',
    SAVED: '/(main)/(tabs)/saved',
    SEARCH: '/(main)/search',
    NOTIFICATIONS: '/(main)/(tabs)/notifications',
    SETTINGS: '/(main)/settings',
    SETTINGS_PRIVACY: '/(main)/settings/privacy',
    SETTINGS_NOTIFICATIONS: '/(main)/settings/notifications-prefs',
    SETTINGS_CHANGE_PASSWORD: '/(main)/settings/change-password',
    SETTINGS_DELETE_ACCOUNT: '/(main)/settings/delete-account',
    PROFILE_PERSONAL_INFO: '/(main)/profile/personal-info',
    PROFILE_ACADEMIC_INFO: '/(main)/profile/academic-info',
    PROFILE_INTERESTS: '/(main)/profile/interests',
    PROFILE_PREFERENCES: '/(main)/profile/preferences',
    PROFILE_BIO: '/(main)/profile/bio',
    opportunity: (id: string) => `/(main)/opportunity/${id}` as const,
    CV_BUILDER: {
      DASHBOARD: '/(main)/(tabs)/cv-builder',
      hub: (id: string) => `/(main)/(tabs)/cv-builder/${id}` as const,
      preview: (id: string) => `/(main)/(tabs)/cv-builder/${id}/preview` as const,
      tips: (id: string) => `/(main)/(tabs)/cv-builder/${id}/tips` as const,
      section: (cvId: string, sectionId: string) =>
        `/(main)/(tabs)/cv-builder/${cvId}/section/${sectionId}` as const,
    },
    HELP: {
      INDEX: '/(main)/help',
      REPORT_BUG: '/(main)/help/report-bug',
      FEATURE_REQUEST: '/(main)/help/feature-request',
      FEEDBACK: '/(main)/help/feedback',
    },
    TABS: {
      BROWSE: '/(main)/(tabs)/browse-categories',
    },
    DRAWER: {
      PROFILE: '/(main)/profile',
      BROWSE: '/(main)/browse-categories',
      category: (slug: string) => `/(main)/category/${slug}` as const,
      HELP: '/(main)/help',
      PRIVACY: '/(main)/legal/privacy',
      TERMS: '/(main)/legal/terms',
      REFER: '/(main)/refer',
    },
  },
  SUPER_ADMIN: {
    HOME: '/(main)/(tabs)/super-admin',
    ANALYTICS: '/(main)/(tabs)/super-admin/analytics',
    MENTORS: '/(main)/(tabs)/super-admin/mentors',
    MENTEES: '/(main)/(tabs)/super-admin/mentees',
    ADMINS: '/(main)/(tabs)/super-admin/admins',
    OPPORTUNITIES: '/(main)/(tabs)/super-admin/opportunities',
    OPPORTUNITY_CREATE: '/(main)/(tabs)/super-admin/opportunities/create',
    OPPORTUNITY_PASTE: '/(main)/(tabs)/super-admin/opportunities/paste',
    OPPORTUNITY_PENDING: '/(main)/(tabs)/super-admin/opportunities/pending',
    opportunityEdit: (id: string) =>
      `/(main)/(tabs)/super-admin/opportunities/${id}/edit` as const,
    pendingReview: (id: string) =>
      `/(main)/(tabs)/super-admin/opportunities/${id}/review` as const,
  },
  ADMIN: {
    HOME: '/(main)/(tabs)/admin',
    OPPORTUNITIES: '/(main)/(tabs)/admin',
    CREATE: '/(main)/(tabs)/admin/create',
    PASTE: '/(main)/(tabs)/admin/paste',
    PENDING: '/(main)/(tabs)/admin/pending',
    edit: (id: string) => `/(main)/(tabs)/admin/${id}/edit` as const,
    pendingReview: (id: string) => `/(main)/(tabs)/admin/${id}/review` as const,
  },
} as const;
