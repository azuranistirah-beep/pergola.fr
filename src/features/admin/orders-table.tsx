"use client";

import * as React from "react";
import Link from "next/link";
import { Search } from "lucide-react";
import { OrderStatusSelect } from "@/features/admin/order-status-select";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import { formatEUR, cn } from "@/lib/utils";
import type { AdminMessageKey } from "@/lib/admin-i18n";

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  total_cents: number;
  items_count: number;
  created_at: string;
}

const STATUSES = [
  "ALL",
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const tone: Record<string, string> = {
  PENDING: "bg-muted text-secondary",
  PAID: "bg-primary/10 text-primary",
  PROCESSING: "bg-accent/15 text-accent",
  SHIPPED: "bg-accent/15 text-accent",
  DELIVERED: "bg-primary/10 text-primary",
  CANCELLED: "bg-muted text-secondary",
  REFUNDED: "bg-muted text-secondary",
};

export function OrdersTable({
  orders,
  dateLocale,
}: {
  orders: OrderRow[];
  dateLocale: string;
}) {
  const { t } = useAdminT();
  const [query, setQuery] = React.useState("");
  const [status, setStatus] = React.useState<(typeof STATUSES)[number]>("ALL");

  const counts = React.useMemo(() => {
    const c: Record<string, number> = { ALL: orders.length };
    orders.forEach((o) => (c[o.status] = (c[o.status] ?? 0) + 1));
    return c;
  }, [orders]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return orders.filter((o) => {
      if (status !== "ALL" && o.status !== status) return false;
      if (!q) return true;
      return (
        o.order_number.toLowerCase().includes(q) ||
        (o.customer_name ?? "").toLowerCase().includes(q) ||
        (o.customer_email ?? "").toLowerCase().includes(q)
      );
    });
  }, [orders, query, status]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {STATUSES.map((s) => {
          const count = counts[s] ?? 0;
          if (s !== "ALL" && count === 0) return null;
          const label =
            s === "ALL"
              ? t("common.total")
              : t(`orders.status.${s}` as AdminMessageKey);
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

      <div className="bg-background border-border/60 rounded-3xl border">
        <div className="border-border/60 flex items-center gap-3 border-b px-6 py-4">
          <Search className="text-secondary size-4" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("common.search") + "…"}
            className="flex-1 bg-transparent text-sm outline-none placeholder:text-secondary/50"
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-border/60 border-b text-left">
              <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                <th>{t("orders.table.reference")}</th>
                <th>{t("orders.table.customer")}</th>
                <th className="text-right">{t("orders.table.items")}</th>
                <th className="text-right">{t("common.total")}</th>
                <th>{t("common.date")}</th>
                <th>{t("common.status")}</th>
                <th className="w-40 text-right">{t("orders.table.action")}</th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {filtered.map((o) => {
                const statusKey = `orders.status.${o.status}` as AdminMessageKey;
                return (
                  <tr key={o.id} className="hover:bg-muted/40">
                    <td className="text-primary px-6 py-4 font-mono text-xs">
                      <Link
                        href={`/admin/orders/${o.id}`}
                        className="hover:underline"
                      >
                        {o.order_number}
                      </Link>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-primary font-medium">
                        {o.customer_name}
                      </div>
                      <div className="text-secondary text-xs">
                        {o.customer_email}
                      </div>
                    </td>
                    <td className="text-right px-6 py-4 font-mono">
                      {o.items_count}
                    </td>
                    <td className="text-right px-6 py-4 font-mono">
                      {formatEUR(o.total_cents)}
                    </td>
                    <td className="text-secondary px-6 py-4 text-xs">
                      {new Date(o.created_at).toLocaleDateString(dateLocale, {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] ${tone[o.status] ?? ""}`}
                      >
                        {t(statusKey)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <OrderStatusSelect id={o.id} current={o.status} />
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-secondary p-12 text-center text-sm"
                  >
                    {query || status !== "ALL" ? "—" : t("orders.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
