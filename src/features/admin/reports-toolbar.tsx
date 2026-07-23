"use client";

import { Download } from "lucide-react";
import { AdminButton } from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";

interface OrderLite {
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  total_cents: number;
  items_count: number;
  currency: string;
  created_at: string;
}

export function ReportsToolbar({ orders }: { orders: OrderLite[] }) {
  const { t } = useAdminT();
  const exportCsv = () => {
    const header = [
      "order_number",
      "customer_name",
      "customer_email",
      "status",
      "items_count",
      "total_cents",
      "currency",
      "created_at",
    ].join(",");
    const rows = orders.map((o) =>
      [
        o.order_number,
        JSON.stringify(o.customer_name ?? ""),
        o.customer_email ?? "",
        o.status,
        o.items_count,
        o.total_cents,
        o.currency,
        o.created_at,
      ].join(","),
    );
    const csv = [header, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <AdminButton variant="outline" onClick={exportCsv} disabled={!orders.length}>
      <Download className="size-3.5" /> {t("reports.export")}
    </AdminButton>
  );
}
