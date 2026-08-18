import Link from "next/link";
import { Package, Plus } from "lucide-react";
import {
  AdminButton,
  AdminHeader,
  AdminSection,
  KpiCard,
} from "@/features/admin/admin-ui";
import { OrdersTable } from "@/features/admin/orders-table";
import { query } from "@/lib/db";
import { formatEUR } from "@/lib/utils";
import { getT } from "@/lib/admin-i18n";

interface Order {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  total_cents: number;
  items_count: number;
  created_at: string;
}

async function load() {
  return query<Order>(
    "SELECT * FROM orders ORDER BY created_at DESC LIMIT 10000",
  );
}

export default async function OrdersPage() {
  const [orders, { t, locale }] = await Promise.all([load(), getT()]);
  const revenue = orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
    .reduce((s, o) => s + o.total_cents, 0);
  const pending = orders.filter((o) => o.status === "PENDING").length;
  const processing = orders.filter(
    (o) => o.status === "PROCESSING" || o.status === "PAID",
  ).length;
  const dateLocale = locale === "id" ? "id-ID" : "en-GB";

  return (
    <>
      <AdminHeader
        title={t("orders.title")}
        subtitle={t("orders.subtitle")}
        actions={
          <Link href="/admin/orders/new">
            <AdminButton variant="primary">
              <Plus className="size-4" /> {t("orderCreate.title")}
            </AdminButton>
          </Link>
        }
      />

      <AdminSection>
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label={t("orders.kpi.total")} value={orders.length} Icon={Package} />
          <KpiCard label={t("orders.kpi.revenue")} value={formatEUR(revenue)} />
          <KpiCard label={t("orders.kpi.pending")} value={pending} hint={t("orders.kpi.pendingHint")} />
          <KpiCard label={t("orders.kpi.processing")} value={processing} />
        </div>
      </AdminSection>

      <AdminSection>
        <OrdersTable orders={orders} dateLocale={dateLocale} />
      </AdminSection>
    </>
  );
}
