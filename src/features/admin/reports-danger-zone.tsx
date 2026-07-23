"use client";

import * as React from "react";
import { toast } from "sonner";
import { RotateCcw, AlertTriangle } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminSection,
} from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import {
  resetCurrentMonth,
  resetAllOrders,
} from "@/actions/admin-orders-actions";

export function ReportsDangerZone() {
  const { t } = useAdminT();
  const [pending, setPending] = React.useState(false);

  const runMonth = async () => {
    if (!confirm(t("reports.resetMonthConfirm"))) return;
    setPending(true);
    try {
      const n = await resetCurrentMonth();
      toast.success(t("reports.reset.success", { n }));
    } catch (e) {
      toast.error(t("common.error"), {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setPending(false);
    }
  };

  const runAll = async () => {
    const typed = prompt(t("reports.resetAllConfirm"));
    if (typed !== "DELETE") return;
    setPending(true);
    try {
      const n = await resetAllOrders();
      toast.success(t("reports.reset.success", { n }));
    } catch (e) {
      toast.error(t("common.error"), {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <AdminSection title={t("reports.danger")}>
      <AdminCard className="border-accent/40 bg-accent/5">
        <div className="flex items-start gap-3">
          <AlertTriangle className="text-accent mt-0.5 size-5 shrink-0" />
          <p className="text-secondary text-sm">{t("reports.dangerHint")}</p>
        </div>
        <div className="mt-6 flex flex-wrap gap-3">
          <AdminButton
            type="button"
            variant="outline"
            onClick={runMonth}
            disabled={pending}
          >
            <RotateCcw className="size-3.5" /> {t("reports.resetMonth")}
          </AdminButton>
          <AdminButton
            type="button"
            variant="danger"
            onClick={runAll}
            disabled={pending}
          >
            <RotateCcw className="size-3.5" /> {t("reports.resetAll")}
          </AdminButton>
        </div>
      </AdminCard>
    </AdminSection>
  );
}
