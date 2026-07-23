"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import {
  deleteContact,
  updateContactStatus,
} from "@/actions/admin-inbox-actions";
import { AdminButton } from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";

type Status = "NEW" | "READ" | "REPLIED" | "ARCHIVED";

export function ContactActionsBar({
  id,
  current,
}: {
  id: string;
  current: Status;
}) {
  const { t } = useAdminT();

  const set = async (next: Status) => {
    try {
      await updateContactStatus(id, next);
      toast.success(t("inbox.statusUpdated"));
    } catch (e) {
      toast.error(t("common.error"), {
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };

  const remove = async () => {
    if (!confirm(t("inbox.deleteConfirm"))) return;
    try {
      await deleteContact(id);
      toast.success(t("inbox.deleted"));
    } catch (e) {
      toast.error(t("common.error"), {
        description: e instanceof Error ? e.message : String(e),
      });
    }
  };

  return (
    <div className="flex items-center gap-2">
      <select
        value={current}
        onChange={(e) => set(e.target.value as Status)}
        className="border-border focus:border-primary rounded-full border bg-transparent px-3 py-1 text-xs outline-none"
      >
        <option value="NEW">{t("inbox.status.NEW")}</option>
        <option value="READ">{t("inbox.status.READ")}</option>
        <option value="REPLIED">{t("inbox.status.REPLIED")}</option>
        <option value="ARCHIVED">{t("inbox.status.ARCHIVED")}</option>
      </select>
      <AdminButton variant="danger" onClick={remove}>
        <Trash2 className="size-3.5" />
      </AdminButton>
    </div>
  );
}
