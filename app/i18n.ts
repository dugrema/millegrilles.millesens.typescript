import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import HttpBackend from "i18next-http-backend";

// Only initialise i18next when we are in the browser
if (!import.meta.env.SSR) {
  i18n
    .use(HttpBackend)
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
      fallbackLng: "en",
      debug: false,
      interpolation: {
        escapeValue: false,
      },
      backend: {
        loadPath: "/millesens/locales/{{lng}}/{{ns}}.json",
      },
    });
}

export default i18n;
