import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { detectOsLanguage } from '@/i18n/detect-language';
import { resources } from '@/i18n/resources';

/**
 * Initialises the shared i18next instance once, at module load. The initial
 * language is the device language (English/French only); the persisted user
 * override, if any, is applied by I18nProvider after AsyncStorage resolves.
 *
 * Resources are bundled, so init completes synchronously and `useTranslation`
 * works on first render.
 */
if (!i18n.isInitialized) {
  void i18n.use(initReactI18next).init({
    resources,
    lng: detectOsLanguage(),
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
    returnNull: false,
  });
}

export default i18n;
