"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminSection,
  fieldClass,
} from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import { saveSite } from "@/actions/admin-actions";
import type { SiteInfoSettings } from "@/repositories/settings-repository";

export function SiteSettingsForm({ initial }: { initial: SiteInfoSettings }) {
  const { t } = useAdminT();
  const [v, setV] = React.useState<SiteInfoSettings>(initial);
  const [pending, setPending] = React.useState(false);

  const set = <K extends keyof SiteInfoSettings>(k: K, val: SiteInfoSettings[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await saveSite(v);
      toast.success(t("settings.saved"));
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AdminSection title={t("settings.section")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-2">
            <AdminLabel label={t("settings.phone")}>
              <input
                value={v.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.email")}>
              <input
                type="email"
                value={v.email}
                onChange={(e) => set("email", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.address")}>
              <input
                value={v.showroomAddress}
                onChange={(e) => set("showroomAddress", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.hours")}>
              <input
                value={v.showroomHours}
                onChange={(e) => set("showroomHours", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.instagram")} hint={t("settings.instagramHint")}>
              <input
                value={v.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel
              label={t("settings.whatsappNumber")}
              hint={t("settings.whatsappNumberHint")}
            >
              <input
                value={v.whatsappNumber}
                onChange={(e) => set("whatsappNumber", e.target.value)}
                className={fieldClass}
                placeholder="6281234567890"
              />
            </AdminLabel>
            <AdminLabel
              label={t("settings.whatsappMessage")}
              hint={t("settings.whatsappMessageHint")}
            >
              <textarea
                value={v.whatsappMessage}
                onChange={(e) => set("whatsappMessage", e.target.value)}
                rows={2}
                className={fieldClass + " resize-none"}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title={t("settings.company")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-2">
            <AdminLabel label={t("settings.companyName")}>
              <input
                value={v.companyName}
                onChange={(e) => set("companyName", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel
              label={t("settings.companyLegalForm")}
              hint={t("settings.companyLegalFormHint")}
            >
              <input
                value={v.companyLegalForm}
                onChange={(e) => set("companyLegalForm", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel
              label={t("settings.companyCapital")}
              hint={t("settings.companyCapitalHint")}
            >
              <input
                value={v.companyCapital}
                onChange={(e) => set("companyCapital", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.companySiret")}>
              <input
                value={v.companySiret}
                onChange={(e) => set("companySiret", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.companyRcs")}>
              <input
                value={v.companyRcs}
                onChange={(e) => set("companyRcs", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.companyVatNumber")}>
              <input
                value={v.companyVatNumber}
                onChange={(e) => set("companyVatNumber", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.companyAddress")}>
              <input
                value={v.companyAddress}
                onChange={(e) => set("companyAddress", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title={t("settings.invoicing")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-3">
            <AdminLabel label={t("settings.vatRatePercent")}>
              <input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={v.vatRatePercent}
                onChange={(e) => set("vatRatePercent", Number(e.target.value))}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel
              label={t("settings.invoicePrefix")}
              hint={t("settings.invoicePrefixHint")}
            >
              <input
                value={v.invoicePrefix}
                onChange={(e) =>
                  set("invoicePrefix", e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, ""))
                }
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.paymentTermsDays")}>
              <input
                type="number"
                min={0}
                value={v.paymentTermsDays}
                onChange={(e) =>
                  set("paymentTermsDays", Number(e.target.value))
                }
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.paymentTerms")}>
              <textarea
                value={v.paymentTerms}
                onChange={(e) => set("paymentTerms", e.target.value)}
                rows={2}
                className={fieldClass + " resize-none md:col-span-3"}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.invoiceFooter")}>
              <textarea
                value={v.invoiceFooter}
                onChange={(e) => set("invoiceFooter", e.target.value)}
                rows={3}
                className={fieldClass + " resize-none md:col-span-3"}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title={t("settings.banking")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-3">
            <AdminLabel label={t("settings.bankName")}>
              <input
                value={v.bankName}
                onChange={(e) => set("bankName", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("settings.bankIban")}>
              <input
                value={v.bankIban}
                onChange={(e) => set("bankIban", e.target.value.toUpperCase())}
                className={fieldClass + " font-mono"}
                placeholder="FR76 1234 5678 9012 3456 7890 123"
              />
            </AdminLabel>
            <AdminLabel label={t("settings.bankBic")}>
              <input
                value={v.bankBic}
                onChange={(e) => set("bankBic", e.target.value.toUpperCase())}
                className={fieldClass + " font-mono"}
                placeholder="BNPAFRPP"
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <div className="border-border/60 sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background/95 p-8 backdrop-blur">
        <AdminButton type="submit" variant="primary" disabled={pending}>
          {pending ? t("common.saving") : t("common.save")}
        </AdminButton>
      </div>
    </form>
  );
}
