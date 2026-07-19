import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { TRANSLATIONS } from "./translations.js";

const LS_KEY = "pergolafr.locale";

const I18nCtx = createContext({
  locale: "fr",
  setLocale: () => {},
  t: (key) => key,
});

function detectInitial() {
  try {
    const saved = localStorage.getItem(LS_KEY);
    if (saved === "fr" || saved === "en") return saved;
  } catch {}
  const lang = (navigator.language || "fr").toLowerCase();
  return lang.startsWith("fr") ? "fr" : "en";
}

export function I18nProvider({ children }) {
  const [locale, setLocaleState] = useState(detectInitial);

  const setLocale = useCallback((next) => {
    setLocaleState(next);
    try {
      localStorage.setItem(LS_KEY, next);
    } catch {}
    document.documentElement.setAttribute("lang", next);
  }, []);

  useEffect(() => {
    document.documentElement.setAttribute("lang", locale);
  }, [locale]);

  const t = useCallback(
    (path) => {
      const parts = path.split(".");
      let node = TRANSLATIONS[locale];
      for (const p of parts) {
        if (node && typeof node === "object" && p in node) node = node[p];
        else return path;
      }
      return typeof node === "string" ? node : path;
    },
    [locale]
  );

  return (
    <I18nCtx.Provider value={{ locale, setLocale, t }}>{children}</I18nCtx.Provider>
  );
}

export const useI18n = () => useContext(I18nCtx);
