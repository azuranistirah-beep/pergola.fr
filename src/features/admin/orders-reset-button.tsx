"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Trash2 } from "lucide-react";
import { AdminButton } from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import { resetAllOrders } from "@/actions/admin-orders-actions";

/**
 * Danger button that wipes every order (used to clear seeded / example data
 * before real customer orders start coming in). Confirms twice: browser
 * confirm + explicit "no rows to delete" tolerance from the server action.
 */
export function OrdersResetButton({ count }: { count: number }) {
  const { t } = useAdminT();
  const router = useRouter();
  const [pending, startTransition] = React.useTransition();

  const onClick = () => {
    if (count === 0) return;
    const msg = t("orders.resetAllConfirm").replace("{n}", String(count));
    if (!confirm(msg)) return;
    startTransition(async () => {
      const deleted = await resetAllOrders();
      alert(t("orders.resetAllDone").replace("{n}", String(deleted)));
      router.refresh();
    });
  };

  return (
    <AdminButton
      type="button"
      variant="danger"
      onClick={onClick}
      disabled={pending || count === 0}
    >
      <Trash2 className="size-4" />
      {t("orders.resetAll")}
    </AdminButton>
  );
}
