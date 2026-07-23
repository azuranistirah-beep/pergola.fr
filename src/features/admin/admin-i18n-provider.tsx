"use client";

import * as React from "react";
import type { AdminLocale, AdminMessageKey } from "@/lib/admin-i18n";

type Dict = Record<AdminMessageKey, string>;

const Ctx = React.createContext<{ locale: AdminLocale; dict: Dict } | null>(null);

export function AdminI18nProvider({
  locale,
  dict,
  children,
}: {
  locale: AdminLocale;
  dict: Dict;
  children: React.ReactNode;
}) {
  return <Ctx.Provider value={{ locale, dict }}>{children}</Ctx.Provider>;
}

export function useAdminT() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useAdminT must be used within AdminI18nProvider");
  const { locale, dict } = ctx;
  const t = React.useCallback(
    (key: AdminMessageKey, vars?: Record<string, string | number>) => {
      let s = dict[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) {
          s = s.replace(new RegExp(`\\{${k}\\}`, "g"), String(v));
        }
      }
      return s;
    },
    [dict],
  );
  return { t, locale };
}
