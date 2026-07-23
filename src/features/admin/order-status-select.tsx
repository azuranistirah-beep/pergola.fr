"use client";

import { toast } from "sonner";
import { updateOrderStatus } from "@/actions/admin-inbox-actions";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import type { AdminMessageKey } from "@/lib/admin-i18n";

const statuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

export function OrderStatusSelect({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  const { t } = useAdminT();
  return (
    <select
      value={current}
      onChange={async (e) => {
        const next = e.target.value as (typeof statuses)[number];
        try {
          await updateOrderStatus(id, next);
          toast.success(t("orders.statusUpdated"));
        } catch (err) {
          toast.error(t("common.error"), {
            description: err instanceof Error ? err.message : String(err),
          });
        }
      }}
      className="border-border focus:border-primary rounded-full border bg-transparent px-3 py-1 text-xs outline-none"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {t(`orders.status.${s}` as AdminMessageKey)}
        </option>
      ))}
    </select>
  );
}
