"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2, Printer } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminSection,
  fieldClass,
} from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import {
  createInvoice,
  updateInvoice,
  deleteInvoice,
  setInvoiceStatus,
  type InvoiceStatus,
} from "@/actions/admin-invoices-actions";
import { formatEUR } from "@/lib/utils";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Line {
  key: string;
  description: string;
  sku: string;
  unitPriceHtEur: string;
  quantity: string;
}

export interface InvoiceFormInitial {
  invoiceNumber: string;
  orderId: string | null;
  status: InvoiceStatus;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  customerAddress: string;
  customerPostal: string;
  customerCity: string;
  customerCountry: string;
  issuedAt: string;
  dueAt: string;
  currency: string;
  vatRatePercent: number;
  notes: string;
  terms: string;
  footer: string;
  items: {
    description: string;
    sku: string;
    unitPriceCents: number;
    quantity: number;
  }[];
}

function newLine(): Line {
  return {
    key: Math.random().toString(36).slice(2),
    description: "",
    sku: "",
    unitPriceHtEur: "0",
    quantity: "1",
  };
}

function toDateInput(iso: string): string {
  if (!iso) return "";
  return new Date(iso).toISOString().slice(0, 10);
}
function toIso(dateStr: string): string {
  return dateStr ? new Date(dateStr).toISOString() : "";
}

export function InvoiceForm({
  invoiceId,
  initial,
}: {
  invoiceId?: string;
  initial: InvoiceFormInitial;
}) {
  const { t } = useAdminT();
  const router = useRouter();
  const [values, setValues] = React.useState({
    ...initial,
    issuedAt: toDateInput(initial.issuedAt) || toDateInput(new Date().toISOString()),
    dueAt: toDateInput(initial.dueAt),
  });
  const [lines, setLines] = React.useState<Line[]>(
    initial.items.length
      ? initial.items.map((it) => ({
          key: Math.random().toString(36).slice(2),
          description: it.description,
          sku: it.sku,
          unitPriceHtEur: (it.unitPriceCents / 100).toFixed(2),
          quantity: String(it.quantity),
        }))
      : [newLine()],
  );
  const [pending, setPending] = React.useState(false);

  const set = <K extends keyof typeof values>(k: K, val: (typeof values)[K]) =>
    setValues((prev) => ({ ...prev, [k]: val }));
  const setLine = (i: number, patch: Partial<Line>) =>
    setLines((prev) => prev.map((l, idx) => (idx === i ? { ...l, ...patch } : l)));

  const subtotalHt = lines.reduce(
    (s, l) =>
      s + Math.round(Number(l.unitPriceHtEur) * 100) * Number(l.quantity || 0),
    0,
  );
  const vatAmount = Math.round(subtotalHt * (values.vatRatePercent / 100));
  const totalTtc = subtotalHt + vatAmount;

  const submit = async (nextStatus?: InvoiceStatus) => {
    const valid = lines.filter(
      (l) => l.description.trim() && Number(l.quantity) > 0,
    );
    if (!valid.length) {
      toast.error(t("invoiceForm.needOneItem"));
      return;
    }
    setPending(true);
    try {
      const payload = {
        invoiceNumber: values.invoiceNumber?.trim() || undefined,
        orderId: values.orderId,
        status: nextStatus ?? values.status,
        customerName: values.customerName,
        customerEmail: values.customerEmail || undefined,
        customerPhone: values.customerPhone || undefined,
        customerAddress: values.customerAddress || undefined,
        customerPostal: values.customerPostal || undefined,
        customerCity: values.customerCity || undefined,
        customerCountry: values.customerCountry || "FR",
        issuedAt: toIso(values.issuedAt),
        dueAt: values.dueAt ? toIso(values.dueAt) : null,
        currency: values.currency,
        vatRatePercent: values.vatRatePercent,
        notes: values.notes || undefined,
        terms: values.terms || undefined,
        footer: values.footer || undefined,
        items: valid.map((l) => ({
          description: l.description,
          sku: l.sku || undefined,
          unitPriceCents: Math.round(Number(l.unitPriceHtEur) * 100),
          quantity: Number(l.quantity),
        })),
      };
      if (invoiceId) {
        await updateInvoice(invoiceId, payload);
        if (nextStatus) set("status", nextStatus);
        toast.success(t("invoiceForm.saved"));
        router.refresh();
      } else {
        const id = await createInvoice(payload);
        toast.success(t("invoiceForm.saved"));
        router.push(`/admin/invoices/${id}`);
      }
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  const onDelete = async () => {
    if (!invoiceId) return;
    if (!confirm(t("invoices.deleteConfirm"))) return;
    setPending(true);
    try {
      await deleteInvoice(invoiceId);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("NEXT_REDIRECT")) {
        toast.error(t("common.error"), { description: msg });
        setPending(false);
      }
    }
  };

  const markStatus = async (s: InvoiceStatus) => {
    if (!invoiceId) return;
    setPending(true);
    try {
      await setInvoiceStatus(invoiceId, s);
      set("status", s);
      toast.success(t("invoiceForm.saved"));
      router.refresh();
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submit();
      }}
      className="space-y-8"
    >
      <AdminSection title={t("invoiceForm.section.identity")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-4">
            <AdminLabel label={t("invoiceForm.number")} hint={t("invoiceForm.numberHint")}>
              <input
                value={values.invoiceNumber}
                onChange={(e) => set("invoiceNumber", e.target.value)}
                className={fieldClass + " font-mono"}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.status")}>
              <select
                value={values.status}
                onChange={(e) => set("status", e.target.value as InvoiceStatus)}
                className={fieldClass}
              >
                <option value="DRAFT">{t("invoices.status.DRAFT")}</option>
                <option value="ISSUED">{t("invoices.status.ISSUED")}</option>
                <option value="PAID">{t("invoices.status.PAID")}</option>
                <option value="CANCELLED">{t("invoices.status.CANCELLED")}</option>
              </select>
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.issuedAt")}>
              <input
                type="date"
                value={values.issuedAt}
                onChange={(e) => set("issuedAt", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.dueAt")}>
              <input
                type="date"
                value={values.dueAt}
                onChange={(e) => set("dueAt", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title={t("invoiceForm.section.customer")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-3">
            <AdminLabel label={t("invoiceForm.customerName")}>
              <input
                required
                value={values.customerName}
                onChange={(e) => set("customerName", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.customerEmail")}>
              <input
                type="email"
                value={values.customerEmail}
                onChange={(e) => set("customerEmail", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.customerPhone")}>
              <input
                value={values.customerPhone}
                onChange={(e) => set("customerPhone", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.customerAddress")}>
              <input
                value={values.customerAddress}
                onChange={(e) => set("customerAddress", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.customerPostal")}>
              <input
                value={values.customerPostal}
                onChange={(e) => set("customerPostal", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.customerCity")}>
              <input
                value={values.customerCity}
                onChange={(e) => set("customerCity", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.customerCountry")}>
              <input
                value={values.customerCountry}
                onChange={(e) => set("customerCountry", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title={t("invoiceForm.section.items")}>
        <AdminCard>
          <div className="space-y-3">
            {lines.map((l, idx) => (
              <div
                key={l.key}
                className="border-border/60 grid gap-3 rounded-2xl border p-4 md:grid-cols-[3fr_1fr_1fr_1fr_1fr_auto]"
              >
                <AdminLabel label={t("invoiceForm.description")}>
                  <input
                    value={l.description}
                    onChange={(e) => setLine(idx, { description: e.target.value })}
                    className={fieldClass}
                  />
                </AdminLabel>
                <AdminLabel label={t("invoiceForm.sku")}>
                  <input
                    value={l.sku}
                    onChange={(e) => setLine(idx, { sku: e.target.value })}
                    className={fieldClass + " font-mono"}
                  />
                </AdminLabel>
                <AdminLabel label={t("invoiceForm.qty")}>
                  <input
                    type="number"
                    min={1}
                    value={l.quantity}
                    onChange={(e) => setLine(idx, { quantity: e.target.value })}
                    className={fieldClass}
                  />
                </AdminLabel>
                <AdminLabel label={t("invoiceForm.unitHt")}>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={l.unitPriceHtEur}
                    onChange={(e) =>
                      setLine(idx, { unitPriceHtEur: e.target.value })
                    }
                    className={fieldClass}
                  />
                </AdminLabel>
                <AdminLabel label={t("invoiceForm.lineTotal")}>
                  <div className="text-primary py-2 font-mono text-sm">
                    {formatEUR(
                      Math.round(Number(l.unitPriceHtEur) * 100) *
                        Number(l.quantity || 0),
                    )}
                  </div>
                </AdminLabel>
                <div className="flex items-end">
                  <button
                    type="button"
                    onClick={() =>
                      setLines((prev) => prev.filter((_, i) => i !== idx))
                    }
                    disabled={lines.length === 1}
                    className="text-secondary hover:text-accent disabled:opacity-30 inline-flex items-center gap-1 rounded-full px-3 py-2 text-xs"
                  >
                    <Trash2 className="size-3.5" /> {t("invoiceForm.remove")}
                  </button>
                </div>
              </div>
            ))}
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => setLines((prev) => [...prev, newLine()])}
            >
              <Plus className="size-4" /> {t("invoiceForm.addLine")}
            </AdminButton>
          </div>

          <div className="border-border/60 mt-6 grid gap-2 border-t pt-4 text-sm md:ml-auto md:max-w-sm">
            <div className="flex justify-between">
              <span className="text-secondary">
                {t("invoiceForm.subtotalHt")}
              </span>
              <span className="font-mono">{formatEUR(subtotalHt)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-secondary">
                {t("invoiceForm.vatAmount")} ({values.vatRatePercent}%)
              </span>
              <span className="font-mono">{formatEUR(vatAmount)}</span>
            </div>
            <div className="border-border/60 text-primary flex justify-between border-t pt-2 text-base font-medium">
              <span>{t("invoiceForm.totalTtc")}</span>
              <span className="font-mono">{formatEUR(totalTtc)}</span>
            </div>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title={t("invoiceForm.section.settings")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-2">
            <AdminLabel label={t("invoiceForm.vatRate")}>
              <input
                type="number"
                min={0}
                max={100}
                step="0.1"
                value={values.vatRatePercent}
                onChange={(e) =>
                  set("vatRatePercent", Number(e.target.value))
                }
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.currency")}>
              <input
                value={values.currency}
                onChange={(e) =>
                  set("currency", e.target.value.toUpperCase().slice(0, 3))
                }
                className={fieldClass + " font-mono"}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.terms")}>
              <textarea
                value={values.terms}
                onChange={(e) => set("terms", e.target.value)}
                rows={2}
                className={fieldClass + " resize-none md:col-span-2"}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.footer")}>
              <textarea
                value={values.footer}
                onChange={(e) => set("footer", e.target.value)}
                rows={3}
                className={fieldClass + " resize-none md:col-span-2"}
              />
            </AdminLabel>
            <AdminLabel label={t("invoiceForm.notes")}>
              <textarea
                value={values.notes}
                onChange={(e) => set("notes", e.target.value)}
                rows={2}
                className={fieldClass + " resize-none md:col-span-2"}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <div className="border-border/60 sticky bottom-0 flex flex-wrap items-center justify-between gap-3 border-t bg-background/95 p-8 backdrop-blur">
        <div className="flex flex-wrap gap-2">
          {invoiceId && (
            <>
              <Link
                href={`/admin/invoices/${invoiceId}/print`}
                target="_blank"
              >
                <AdminButton type="button" variant="outline">
                  <Printer className="size-4" /> {t("invoices.print")}
                </AdminButton>
              </Link>
              {values.status !== "PAID" && (
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={() => markStatus("PAID")}
                  disabled={pending}
                >
                  {t("invoices.markPaid")}
                </AdminButton>
              )}
              {values.status === "DRAFT" && (
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={() => markStatus("ISSUED")}
                  disabled={pending}
                >
                  {t("invoices.markIssued")}
                </AdminButton>
              )}
              <AdminButton
                type="button"
                variant="danger"
                onClick={onDelete}
                disabled={pending}
              >
                <Trash2 className="size-4" /> {t("common.delete")}
              </AdminButton>
            </>
          )}
        </div>
        <div className="flex gap-3">
          {!invoiceId && (
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => submit("DRAFT")}
              disabled={pending}
            >
              {t("invoiceForm.saveDraft")}
            </AdminButton>
          )}
          <AdminButton
            type={invoiceId ? "submit" : "button"}
            variant="primary"
            disabled={pending}
            onClick={invoiceId ? undefined : () => submit("ISSUED")}
          >
            {pending
              ? t("common.saving")
              : invoiceId
                ? t("common.save")
                : t("invoiceForm.saveIssued")}
          </AdminButton>
        </div>
      </div>
    </form>
  );
}
