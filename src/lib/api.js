import { useEffect, useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";

export function useApi(path, fallback = null) {
  const { locale } = useI18n();
  const [data, setData] = useState(fallback);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    const sep = path.includes("?") ? "&" : "?";
    const url = `${path}${sep}locale=${locale}`;
    fetch(url)
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error(String(r.status)))))
      .then((json) => {
        if (!cancelled) setData(json);
      })
      .catch((e) => !cancelled && setError(e))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [path, locale]);

  return { data, loading, error };
}

export function formatEUR(cents, locale = "fr") {
  if (cents == null) return "—";
  return new Intl.NumberFormat(locale === "fr" ? "fr-FR" : "en-GB", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
