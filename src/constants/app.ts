import { env } from '@/config/env';

export const SUPPORT_EMAIL = 'support@voila-africa.com';

/** Web base for shared opportunity links — falls back to LANDING_URL. */
export const APP_WEB_BASE_URL =
  (process.env.EXPO_PUBLIC_APP_WEB_URL ?? env.LANDING_URL).replace(/\/$/, '');

export const REFERRAL_MESSAGE =
  `Join me on Voila — discover scholarships, internships and opportunities worldwide! ${env.LANDING_URL}`;
