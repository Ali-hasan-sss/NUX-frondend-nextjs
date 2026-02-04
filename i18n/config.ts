import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import enTranslations from "./locales/en.json";
import arTranslations from "./locales/ar.json";
import deTranslations from "./locales/de.json";
import trTranslations from "./locales/tr.json";

const resources = {
  en: {
    translation: enTranslations,
  },
  ar: {
    translation: arTranslations,
  },
  de: {
    translation: deTranslations,
  },
  tr: {
    translation: trTranslations,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng:
    typeof window !== "undefined"
      ? localStorage.getItem("language") || "en"
      : "en",
  fallbackLng: "en",
  defaultNS: "translation",
  ns: ["translation"],
  returnEmptyString: false,
  returnNull: false,
  debug: typeof window !== "undefined" && window.location.hostname === "localhost",
  interpolation: {
    escapeValue: false,
  },
  react: {
    useSuspense: false,
  },
  load: "all",
  cleanCode: false,
  saveMissing: false,
  partialBundledLanguages: true,
});

export default i18n;
