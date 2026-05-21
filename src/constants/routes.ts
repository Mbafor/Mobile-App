/**
 * Typed route hrefs for Expo Router — single source of truth for navigation.
 */
export const ROUTES = {
  ROOT: '/',
  AUTH: {
    WELCOME: '/(auth)/welcome',
    EMAIL: '/(auth)/email',
    VERIFY_OTP: '/(auth)/verify-otp',
  },
  ONBOARDING: {
    BASIC_INFO: '/(onboarding)/basic-information',
    ACADEMIC: '/(onboarding)/academic-information',
    PREFERENCES: '/(onboarding)/opportunity-preferences',
  },
  MAIN: {
    DASHBOARD: '/(main)/(tabs)/dashboard',
    SAVED: '/(main)/(tabs)/saved',
    NOTIFICATIONS: '/(main)/(tabs)/notifications',
    SETTINGS: '/(main)/settings',
    SETTINGS_PROFILE: '/(main)/settings/profile',
    SETTINGS_PRIVACY: '/(main)/settings/privacy',
    SETTINGS_NOTIFICATIONS: '/(main)/settings/notifications-prefs',
    opportunity: (id: string) => `/(main)/opportunity/${id}` as const,
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
  ADMIN: {
    HOME: '/(main)/(tabs)/admin',
    OPPORTUNITIES: '/(main)/(tabs)/admin/opportunities',
    CREATE: '/(main)/(tabs)/admin/create',
    edit: (id: string) => `/(main)/(tabs)/admin/${id}/edit` as const,
  },
} as const;
