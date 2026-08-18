import Link from "next/link";
import { Package, TrendingUp, Users, ShoppingBag } from "lucide-react";
import {
  AdminCard,
  AdminHeader,
  AdminSection,
  KpiCard,
} from "@/features/admin/admin-ui";
import { ReportsToolbar } from "@/features/admin/reports-toolbar";
import { ReportsDangerZone } from "@/features/admin/reports-danger-zone";
import { query, toSqlDate } from "@/lib/db";
import { formatEUR } from "@/lib/utils";
import { getT } from "@/lib/admin-i18n";

type Period = "thisMonth" | "lastMonth" | "thisYear" | "allTime";

function rangeFor(period: Period): { from: Date | null; to: Date | null } {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  switch (period) {
    case "thisMonth":
      return { from: new Date(Date.UTC(y, m, 1)), to: new Date(Date.UTC(y, m + 1, 1)) };
    case "lastMonth":
      return { from: new Date(Date.UTC(y, m - 1, 1)), to: new Date(Date.UTC(y, m, 1)) };
    case "thisYear":
      return { from: new Date(Date.UTC(y, 0, 1)), to: new Date(Date.UTC(y + 1, 0, 1)) };
    default:
      return { from: null, to: null };
  }
}

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  total_cents: number;
  currency: string;
  items_count: number;
  created_at: string;
}

interface ItemRow {
  order_id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  line_total_cents: number;
}

async function loadReport(period: Period) {
  const { from, to } = rangeFor(period);
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (from) {
    clauses.push("created_at >= ?");
    params.push(toSqlDate(from));
  }
  if (to) {
    clauses.push("created_at < ?");
    params.push(toSqlDate(to));
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const orders = await query<OrderRow>(
    `SELECT * FROM orders ${where} ORDER BY created_at DESC`,
    params,
  );

  const orderIds = orders.map((o) => o.id);
  let items: ItemRow[] = [];
  if (orderIds.length) {
    items = await query<ItemRow>(
      "SELECT order_id, product_id, product_name, quantity, line_total_cents " +
        "FROM order_items WHERE order_id IN (?)",
      [orderIds],
    );
  }
  return { orders, items };
}

const PAID_STATUSES = new Set(["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]);

export default async function ReportsPage({
  searchParams,
}: {
  searchParams: Promise<{ period?: string }>;
}) {
  const raw = (await searchParams).period;
  const period: Period = (
    ["thisMonth", "lastMonth", "thisYear", "allTime"] as const
  ).includes(raw as Period)
    ? (raw as Period)
    : "thisMonth";

  const [{ orders, items }, { t, locale }] = await Promise.all([
    loadReport(period),
    getT(),
  ]);
  const dateLocale = locale === "id" ? "id-ID" : "en-GB";

  const revenue = orders
    .filter((o) => PAID_STATUSES.has(o.status))
    .reduce((s, o) => s + o.total_cents, 0);
  const paidCount = orders.filter((o) => PAID_STATUSES.has(o.status)).length;
  const avgOrder = paidCount ? Math.round(revenue / paidCount) : 0;
  const itemsSold = items.reduce((s, it) => s + (it.quantity ?? 0), 0);
  const uniqueCustomers = new Set(
    orders.map((o) => (o.customer_email || "").toLowerCase()).filter(Boolean),
  ).size;

  const statusCounts = orders.reduce<Record<string, number>>((acc, o) => {
    acc[o.status] = (acc[o.status] ?? 0) + 1;
    return acc;
  }, {});

  const productAgg = new Map<
    string,
    { name: string; units: number; revenue: number }
  >();
  for (const it of items) {
    const key = it.product_id ?? it.product_name;
    const prev = productAgg.get(key) ?? {
      name: it.product_name,
      units: 0,
      revenue: 0,
    };
    prev.units += it.quantity ?? 0;
    prev.revenue += it.line_total_cents ?? 0;
    productAgg.set(key, prev);
  }
  const topProducts = [...productAgg.values()]
    .sort((a, b) => b.units - a.units)
    .slice(0, 5);

  return (
    <>
      <AdminHeader
        title={t("reports.title")}
        subtitle={t("reports.subtitle")}
        actions={<ReportsToolbar orders={orders} />}
      />

      <AdminSection>
        <div className="mb-6 flex flex-wrap gap-2">
          {(
            [
              ["thisMonth", "reports.period.thisMonth"],
              ["lastMonth", "reports.period.lastMonth"],
              ["thisYear", "reports.period.thisYear"],
              ["allTime", "reports.period.allTime"],
            ] as const
          ).map(([key, label]) => (
            <Link
              key={key}
              href={`/admin/reports?period=${key}`}
              className={
                "rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.2em] transition-colors " +
                (period === key
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-secondary hover:border-primary hover:text-primary")
              }
            >
              {t(label)}
            </Link>
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard
            label={t("reports.kpi.revenue")}
            value={formatEUR(revenue)}
            Icon={TrendingUp}
          />
          <KpiCard
            label={t("reports.kpi.orders")}
            value={orders.length}
            Icon={Package}
          />
          <KpiCard
            label={t("reports.kpi.paidOrders")}
            value={paidCount}
            hint={`${orders.length ? Math.round((paidCount / orders.length) * 100) : 0}%`}
          />
          <KpiCard
            label={t("reports.kpi.avgOrder")}
            value={formatEUR(avgOrder)}
            Icon={ShoppingBag}
          />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          <KpiCard label={t("reports.kpi.itemsSold")} value={itemsSold} />
          <KpiCard
            label={t("reports.kpi.newCustomers")}
            value={uniqueCustomers}
            Icon={Users}
          />
          <AdminCard>
            <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
              {t("reports.statusBreakdown")}
            </div>
            <ul className="mt-3 space-y-1 text-sm">
              {Object.entries(statusCounts).map(([k, v]) => (
                <li key={k} className="flex justify-between">
                  <span className="text-secondary">{k}</span>
                  <span className="font-mono">{v}</span>
                </li>
              ))}
              {!orders.length && (
                <li className="text-secondary text-xs">—</li>
              )}
            </ul>
          </AdminCard>
        </div>
      </AdminSection>

      <AdminSection title={t("reports.topProducts")}>
        {topProducts.length === 0 ? (
          <AdminCard className="text-secondary py-8 text-center text-sm">
            {t("reports.topProducts.empty")}
          </AdminCard>
        ) : (
          <AdminCard className="p-0">
            <table className="w-full text-sm">
              <thead className="border-border/60 border-b text-left">
                <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                  <th>{t("products.table.name")}</th>
                  <th className="text-right">{t("reports.topProducts.units")}</th>
                  <th className="text-right">{t("reports.kpi.revenue")}</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {topProducts.map((p) => (
                  <tr key={p.name}>
                    <td className="text-primary px-6 py-3 font-medium">
                      {p.name}
                    </td>
                    <td className="text-right px-6 py-3 font-mono">
                      {p.units}
                    </td>
                    <td className="text-right px-6 py-3 font-mono">
                      {formatEUR(p.revenue)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </AdminCard>
        )}
      </AdminSection>

      <AdminSection title={t("reports.recentOrders")}>
        <AdminCard className="p-0">
          <table className="w-full text-sm">
            <thead className="border-border/60 border-b text-left">
              <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                <th>{t("dashboard.table.reference")}</th>
                <th>{t("dashboard.table.customer")}</th>
                <th className="text-right">{t("common.total")}</th>
                <th>{t("common.status")}</th>
                <th className="text-right">{t("common.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {orders.slice(0, 10).map((o) => (
                <tr key={o.id} className="hover:bg-muted/40">
                  <td className="px-6 py-3 font-mono text-xs">
                    <Link
                      href={`/admin/orders/${o.id}`}
                      className="hover:underline"
                    >
                      {o.order_number}
                    </Link>
                  </td>
                  <td className="text-primary px-6 py-3">
                    {o.customer_name}
                  </td>
                  <td className="text-right px-6 py-3 font-mono">
                    {formatEUR(o.total_cents)}
                  </td>
                  <td className="text-secondary px-6 py-3 text-xs">
                    {o.status.toLowerCase()}
                  </td>
                  <td className="text-secondary text-right px-6 py-3 text-xs">
                    {new Date(o.created_at).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminCard>
      </AdminSection>

      <ReportsDangerZone />
    </>
  );
}
