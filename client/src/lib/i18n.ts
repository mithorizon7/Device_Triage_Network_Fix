import i18n from 'i18next';
import { initReactI18next, useTranslation as useTranslationOriginal } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import ICU from 'i18next-icu';
import type { TranslationKey } from './i18n-keys';

import en from '../locales/en.json';
import lv from '../locales/lv.json';
import ru from '../locales/ru.json';

export type { TranslationKey } from './i18n-keys';

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
    fallbackLng: {
      'lv': ['en'],
      'ru': ['en', 'lv'],
      'default': ['en']
    },
    supportedLngs: ['en', 'lv', 'ru'],
    load: 'languageOnly',
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
    },
    saveMissing: import.meta.env.DEV,
    missingKeyHandler: import.meta.env.DEV 
      ? (lngs, ns, key) => {
          console.warn(`[MISSING:${key}] in ${lngs.join(', ')}`);
        }
      : undefined,
    parseMissingKeyHandler: import.meta.env.DEV 
      ? (key) => `[MISSING:${key}]`
      : undefined
  });

export default i18n;

/**
 * Type-safe translation function type.
 * Use this when passing `t` as a prop or storing in a variable.
 */
export type TypedTFunction = (key: TranslationKey | (string & {}), options?: Record<string, unknown>) => string;

/**
 * Type-safe wrapper for useTranslation hook.
 * The `t` function accepts any string but provides autocomplete for known keys.
 * This allows compile-time checking while still supporting dynamic keys like deviceLabels.
 */
export function useTypedTranslation() {
  const { t, i18n: i18nInstance, ready } = useTranslationOriginal();
  return {
    t: t as TypedTFunction,
    i18n: i18nInstance,
    ready
  };
}

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

export function getDeviceDisplayLabel(
  deviceId: string,
  deviceLabel: string,
  scenarioId: string | null,
  t: (key: string, options?: { defaultValue?: string }) => string
): string {
  if (!scenarioId) return deviceLabel;
  const key = `deviceLabels.${scenarioId}.${deviceId}`;
  const translated = t(key, { defaultValue: '' });
  return translated || deviceLabel;
}
