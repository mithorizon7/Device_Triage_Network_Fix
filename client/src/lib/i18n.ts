import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ICU from 'i18next-icu';

import en from '../locales/en.json';
import lv from '../locales/lv.json';
import ru from '../locales/ru.json';

const resources = {
  en: { translation: en },
  lv: { translation: lv },
  ru: { translation: ru }
};

i18n
  .use(ICU)
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    supportedLngs: ['en', 'lv', 'ru'],
    interpolation: {
      escapeValue: false
    },
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'deviceTriage_language',
      caches: ['localStorage']
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;

export const languages = [
  { code: 'en', name: 'English', nativeName: 'English' },
  { code: 'lv', name: 'Latvian', nativeName: 'Latviešu' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский' }
];

export function formatNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale || i18n.language).format(value);
}

export function formatDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale || i18n.language, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
}
