/** Languages the app ships translations for. */
export type ResolvedLanguage = 'en' | 'fr';

/**
 * User-facing language preference.
 * 'system' follows the device language (falling back to English when the
 * device language is neither English nor French); 'en' / 'fr' pin the choice.
 */
export type LanguageMode = 'system' | ResolvedLanguage;

export const SUPPORTED_LANGUAGES: readonly ResolvedLanguage[] = ['en', 'fr'];
