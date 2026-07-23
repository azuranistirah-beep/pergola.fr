"use client";

import { Trash2 } from "lucide-react";
import { AdminButton } from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import { deleteOrder } from "@/actions/admin-orders-actions";

export function OrderDeleteButton({ id }: { id: string }) {
  const { t } = useAdminT();
  const boundDelete = deleteOrder.bind(null, id);
  return (
    <form action={boundDelete}>
      <AdminButton
        type="submit"
        variant="danger"
        onClick={(e) => {
          if (!confirm(t("orderDetail.deleteConfirm"))) e.preventDefault();
        }}
      >
        <Trash2 className="size-3.5" /> {t("common.delete")}
      </AdminButton>
    </form>
  );
}
