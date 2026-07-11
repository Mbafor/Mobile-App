import en from '@/i18n/locales/en.json';
import fr from '@/i18n/locales/fr.json';

/**
 * i18next resource map. Each language holds a single default `translation`
 * namespace; keys are nested by feature (e.g. `settings.language.system`).
 */
export const resources = {
  en: { translation: en },
  fr: { translation: fr },
} as const;
