import i18n, { type Resource } from "i18next";
import { initReactI18next, useTranslation as useTranslationOriginal } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import ICU from "i18next-icu";
import type { TranslationKey } from "./i18n-keys";

import en from "../locales/en.json";

export type { TranslationKey } from "./i18n-keys";

type AppLanguage = "en" | "lv" | "ru";
type TranslationResource = typeof en;

const LANGUAGE_STORAGE_KEY = "deviceTriage_language";
const supportedLanguages = ["en", "lv", "ru"] as const;
const localeLoaders = {
  en: async () => en,
  lv: async () => (await import("../locales/lv.json")).default,
  ru: async () => (await import("../locales/ru.json")).default,
} satisfies Record<AppLanguage, () => Promise<TranslationResource>>;

const fallbackLng = {
  lv: ["en"],
  ru: ["en", "lv"],
  default: ["en"],
} as const;

let initializePromise: Promise<void> | null = null;
let changeLanguageWrapped = false;
let languageRequest = 0;

function normalizeLanguage(language?: string | readonly string[] | null): AppLanguage {
  const candidate = Array.isArray(language) ? language[0] : language;
  const baseLanguage = candidate?.toLowerCase().split("-")[0];

  return supportedLanguages.includes(baseLanguage as AppLanguage)
    ? (baseLanguage as AppLanguage)
    : "en";
}

function detectInitialLanguage(): AppLanguage {
  if (typeof window === "undefined") return "en";

  try {
    const storedLanguage = window.localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (storedLanguage) {
      return normalizeLanguage(storedLanguage);
    }
  } catch {
    // Ignore localStorage errors and fall back to navigator detection.
  }

  if (window.navigator.languages.length > 0) {
    return normalizeLanguage(window.navigator.languages);
  }

  return normalizeLanguage(window.navigator.language);
}

async function buildInitialResources(language: AppLanguage): Promise<Resource> {
  const resources: Resource = {
    en: { translation: en },
  };

  if (language !== "en") {
    resources[language] = {
      translation: await localeLoaders[language](),
    };
  }

  return resources;
}

async function ensureLanguageBundle(language: AppLanguage): Promise<void> {
  if (language === "en" || i18n.hasResourceBundle(language, "translation")) {
    return;
  }

  const messages = await localeLoaders[language]();
  i18n.addResourceBundle(language, "translation", messages, true, true);
}

function wrapChangeLanguage() {
  if (changeLanguageWrapped) return;

  const originalChangeLanguage = i18n.changeLanguage.bind(i18n);

  i18n.changeLanguage = (async (...args: Parameters<typeof originalChangeLanguage>) => {
    const [requestedLanguage, callback] = args;
    const targetLanguage = normalizeLanguage(requestedLanguage ?? i18n.language);
    const request = ++languageRequest;

    await ensureLanguageBundle(targetLanguage);
    if (request !== languageRequest) {
      const translate = i18n.t.bind(i18n);
      callback?.(null, translate);
      return translate;
    }

    return originalChangeLanguage(targetLanguage, callback);
  }) as typeof i18n.changeLanguage;

  changeLanguageWrapped = true;
}

export async function initializeI18n(): Promise<void> {
  if (initializePromise) {
    return initializePromise;
  }

  initializePromise = (async () => {
    i18n.on("languageChanged", (language) => {
      if (typeof document !== "undefined") {
        document.documentElement.lang = normalizeLanguage(language);
      }
    });
    let initialLanguage = detectInitialLanguage();
    let resources: Resource;
    try {
      resources = await buildInitialResources(initialLanguage);
    } catch {
      // English ships in the entry chunk, so a failed locale download must not blank the app.
      initialLanguage = "en";
      resources = await buildInitialResources("en");
    }

    await i18n
      .use(ICU)
      .use(LanguageDetector)
      .use(initReactI18next)
      .init({
        resources,
        lng: initialLanguage,
        fallbackLng,
        supportedLngs: [...supportedLanguages],
        load: "languageOnly",
        interpolation: {
          escapeValue: false,
        },
        detection: {
          order: ["localStorage", "navigator"],
          lookupLocalStorage: LANGUAGE_STORAGE_KEY,
          caches: ["localStorage"],
        },
        react: {
          useSuspense: false,
        },
        saveMissing: import.meta.env.DEV,
        missingKeyHandler: import.meta.env.DEV
          ? (lngs, _ns, key) => {
              console.warn(`[MISSING:${key}] in ${lngs.join(", ")}`);
            }
          : undefined,
        parseMissingKeyHandler: import.meta.env.DEV ? (key) => `[MISSING:${key}]` : undefined,
      });

    wrapChangeLanguage();
  })();

  return initializePromise;
}

export default i18n;

/**
 * Type-safe translation function type.
 * Use this when passing `t` as a prop or storing in a variable.
 */
export type TypedTFunction = (
  key: TranslationKey | (string & {}),
  options?: Record<string, unknown>
) => string;

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
    ready,
  };
}

export const languages = [
  { code: "en", labelKey: "languages.en", nativeName: "English" },
  { code: "lv", labelKey: "languages.lv", nativeName: "Latviešu" },
  { code: "ru", labelKey: "languages.ru", nativeName: "Русский" },
];

export function formatNumber(value: number, locale?: string): string {
  return new Intl.NumberFormat(locale || i18n.language).format(value);
}

export function formatDate(date: Date, locale?: string): string {
  return new Intl.DateTimeFormat(locale || i18n.language, {
    year: "numeric",
    month: "long",
    day: "numeric",
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
  const translated = t(key, { defaultValue: "" });
  return translated || deviceLabel;
}
