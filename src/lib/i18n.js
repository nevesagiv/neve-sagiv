import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import he from '../locales/he.json';
import ru from '../locales/ru.json';

const SUPPORTED_LANGUAGES = ['he', 'ru'];
const DEFAULT_LANGUAGE = 'he';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      he: { translation: he },
      ru: { translation: ru },
    },
    fallbackLng: DEFAULT_LANGUAGE,
    supportedLngs: SUPPORTED_LANGUAGES,
    detection: {
      order: ['localStorage', 'navigator'],
      caches: ['localStorage'],
      lookupLocalStorage: 'shlomo-adiv-lang',
    },
    interpolation: {
      escapeValue: false,
    },
    returnEmptyString: false,
  });

// Sync language to html dir and lang attributes whenever it changes.
function syncLanguageToDom(lng) {
  const dir = lng === 'he' ? 'rtl' : 'ltr';
  document.documentElement.setAttribute('lang', lng);
  document.documentElement.setAttribute('dir', dir);
  document.body.setAttribute('data-lang', lng);
}

syncLanguageToDom(i18n.language || DEFAULT_LANGUAGE);
i18n.on('languageChanged', syncLanguageToDom);

export default i18n;
export { SUPPORTED_LANGUAGES, DEFAULT_LANGUAGE };
