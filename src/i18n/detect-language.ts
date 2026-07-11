import { getLocales } from 'expo-localization';

import type { ResolvedLanguage } from '@/i18n/types';

/**
 * Reads the device's preferred language synchronously and maps it to a
 * language the app supports. Anything other than French falls back to English.
 */
export function detectOsLanguage(): ResolvedLanguage {
  const code = getLocales()[0]?.languageCode?.toLowerCase();
  return code === 'fr' ? 'fr' : 'en';
}
