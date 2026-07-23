"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import { formatEUR, cn } from "@/lib/utils";
import type { AdminMessageKey } from "@/lib/admin-i18n";

interface Row {
  id: string;
  invoice_number: string;
  status: string;
  customer_name: string;
  customer_email: string | null;
  issued_at: string;
  due_at: string | null;
  total_ttc_cents: number;
}

const STATUSES = ["ALL", "DRAFT", "ISSUED", "PAID", "CANCELLED"] as const;

const tone: Record<string, string> = {
  DRAFT: "bg-muted text-secondary",
  ISSUED: "bg-accent/15 text-accent",
  PAID: "bg-primary/10 text-primary",
  CANCELLED: "bg-muted text-secondary",
};

export function InvoicesTable({
  rows,
  dateLocale,
}: {
  rows: Row[];
  dateLocale: string;
}) {
  const { t } = useAdminT();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<(typeof STATUSES)[number]>("ALL");

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { ALL: rows.length };
    rows.forEach((r) => (c[r.status] = (c[r.status] ?? 0) + 1));
    return c;
  }, [rows]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return rows.filter((r) => {
      if (status !== "ALL" && r.status !== status) return false;
      if (!q) return true;
      return (
        r.invoice_number.toLowerCase().includes(q) ||
        r.customer_name.toLowerCase().includes(q) ||
        (r.customer_email ?? "").toLowerCase().includes(q)
      );
    });
  }, [rows, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => {
          const count = counts[s] ?? 0;
          if (s !== "ALL" && count === 0) return null;
          const label =
            s === "ALL"
              ? t("common.total")
              : t(`invoices.status.${s}` as AdminMessageKey);
          const active = status === s;
          return (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-primary hover:border-primary",
              )}
            >
              {label}
              <span
                className={cn(
                  "ml-2 text-[10px]",
                  active ? "text-primary-foreground/70" : "text-secondary",
                )}
              >
                ({count})
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-background border-border/60 overflow-hidden rounded-3xl border">
        <div className="border-border/60 flex items-center gap-3 border-b px-6 py-4">
          <Search className="text-secondary size-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search") + "…"}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-secondary/50"
          />
        </div>
        <table className="w-full text-sm">
          <thead className="border-border/60 border-b text-left">
            <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
              <th>{t("invoices.table.number")}</th>
              <th>{t("invoices.table.customer")}</th>
              <th>{t("invoices.table.issued")}</th>
              <th>{t("invoices.table.due")}</th>
              <th className="text-right">{t("invoices.table.total")}</th>
              <th>{t("common.status")}</th>
              <th className="w-20 text-right">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {filtered.map((r) => (
              <tr key={r.id} className="hover:bg-muted/40">
                <td className="px-6 py-4 font-mono text-xs">
                  <Link
                    href={`/admin/invoices/${r.id}`}
                    className="text-primary hover:underline"
                  >
                    {r.invoice_number}
                  </Link>
                </td>
                <td className="px-6 py-4">
                  <div className="text-primary font-medium">
                    {r.customer_name}
                  </div>
                  <div className="text-secondary text-xs">
                    {r.customer_email}
                  </div>
                </td>
                <td className="text-secondary px-6 py-4 text-xs">
                  {new Date(r.issued_at).toLocaleDateString(dateLocale, {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </td>
                <td className="text-secondary px-6 py-4 text-xs">
                  {r.due_at
                    ? new Date(r.due_at).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </td>
                <td className="text-right px-6 py-4 font-mono">
                  {formatEUR(r.total_ttc_cents)}
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] ${tone[r.status] ?? ""}`}
                  >
                    {t(`invoices.status.${r.status}` as AdminMessageKey)}
                  </span>
                </td>
                <td className="px-6 py-4 text-right">
                  <Link
                    href={`/admin/invoices/${r.id}`}
                    className="text-primary text-xs underline underline-offset-4"
                  >
                    {t("common.edit")}
                  </Link>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-secondary p-12 text-center text-sm"
                >
                  {query || status !== "ALL" ? "—" : t("invoices.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
