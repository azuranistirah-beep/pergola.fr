"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Star, ToggleLeft, ToggleRight, Trash2, X } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminSection,
  fieldClass,
} from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import {
  createPaymentMethod,
  deletePaymentMethod,
  setDefaultPaymentMethod,
  togglePaymentMethodActive,
  updatePaymentMethod,
  type PaymentMethodInput,
} from "@/actions/admin-payment-methods-actions";
import { cn } from "@/lib/utils";

interface Row {
  id: string;
  label: string;
  holder: string | null;
  bank_name: string | null;
  iban: string | null;
  bic: string | null;
  notes: string | null;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

const empty: PaymentMethodInput = {
  label: "",
  holder: "",
  bankName: "",
  iban: "",
  bic: "",
  notes: "",
  isActive: true,
  isDefault: false,
  sortOrder: 0,
};

function toInput(r: Row): PaymentMethodInput {
  return {
    label: r.label,
    holder: r.holder ?? "",
    bankName: r.bank_name ?? "",
    iban: r.iban ?? "",
    bic: r.bic ?? "",
    notes: r.notes ?? "",
    isActive: r.is_active,
    isDefault: r.is_default,
    sortOrder: r.sort_order,
  };
}

export function PaymentMethodsManager({ methods }: { methods: Row[] }) {
  const { t } = useAdminT();
  const [editing, setEditing] = React.useState<Row | null | "new">(null);
  const [values, setValues] = React.useState<PaymentMethodInput>(empty);
  const [pending, setPending] = React.useState(false);

  React.useEffect(() => {
    if (editing === null) return;
    if (editing === "new") setValues(empty);
    else setValues(toInput(editing));
  }, [editing]);

  const openNew = () => setEditing("new");
  const openEdit = (r: Row) => setEditing(r);
  const closeForm = () => setEditing(null);

  const set = <K extends keyof PaymentMethodInput>(
    k: K,
    v: PaymentMethodInput[K],
  ) => setValues((prev) => ({ ...prev, [k]: v }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      if (editing === "new") {
        await createPaymentMethod(values);
      } else if (editing) {
        await updatePaymentMethod(editing.id, values);
      }
      toast.success(t("paymentMethods.saved"));
      closeForm();
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  const makeDefault = async (id: string) => {
    try {
      await setDefaultPaymentMethod(id);
      toast.success(t("paymentMethods.saved"));
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const toggle = async (r: Row) => {
    try {
      await togglePaymentMethodActive(r.id, !r.is_active);
      toast.success(t("paymentMethods.saved"));
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  const remove = async (id: string) => {
    if (!confirm(t("paymentMethods.deleteConfirm"))) return;
    try {
      await deletePaymentMethod(id);
      toast.success(t("paymentMethods.deleted"));
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  };

  return (
    <>
      <AdminSection>
        {editing === null ? (
          <AdminButton type="button" variant="primary" onClick={openNew}>
            <Plus className="size-4" /> {t("paymentMethods.new")}
          </AdminButton>
        ) : (
          <AdminCard>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-primary font-serif text-xl">
                {editing === "new"
                  ? t("paymentMethods.form.newTitle")
                  : t("paymentMethods.form.editTitle")}
              </h2>
              <button
                type="button"
                onClick={closeForm}
                className="text-secondary hover:text-primary"
                aria-label={t("common.cancel")}
              >
                <X className="size-4" />
              </button>
            </div>
            <form onSubmit={save} className="grid gap-5 md:grid-cols-2">
              <AdminLabel
                label={t("paymentMethods.form.label")}
                hint={t("paymentMethods.form.labelHint")}
              >
                <input
                  required
                  value={values.label}
                  onChange={(e) => set("label", e.target.value)}
                  className={fieldClass}
                />
              </AdminLabel>
              <AdminLabel
                label={t("paymentMethods.form.holder")}
                hint={t("paymentMethods.form.holderHint")}
              >
                <input
                  value={values.holder ?? ""}
                  onChange={(e) => set("holder", e.target.value)}
                  className={fieldClass}
                />
              </AdminLabel>
              <AdminLabel label={t("paymentMethods.form.bankName")}>
                <input
                  value={values.bankName ?? ""}
                  onChange={(e) => set("bankName", e.target.value)}
                  className={fieldClass}
                />
              </AdminLabel>
              <AdminLabel label={t("paymentMethods.form.iban")}>
                <input
                  value={values.iban ?? ""}
                  onChange={(e) =>
                    set("iban", e.target.value.toUpperCase())
                  }
                  className={fieldClass + " font-mono"}
                  placeholder="FR76 1234 5678 9012 3456 7890 123"
                />
              </AdminLabel>
              <AdminLabel label={t("paymentMethods.form.bic")}>
                <input
                  value={values.bic ?? ""}
                  onChange={(e) => set("bic", e.target.value.toUpperCase())}
                  className={fieldClass + " font-mono"}
                  placeholder="AGRIFRPP"
                />
              </AdminLabel>
              <AdminLabel label={t("paymentMethods.form.sortOrder")}>
                <input
                  type="number"
                  value={values.sortOrder}
                  onChange={(e) =>
                    set("sortOrder", Number(e.target.value) || 0)
                  }
                  className={fieldClass}
                />
              </AdminLabel>
              <AdminLabel
                label={t("paymentMethods.form.notes")}
                hint={t("paymentMethods.form.notesHint")}
              >
                <textarea
                  value={values.notes ?? ""}
                  onChange={(e) => set("notes", e.target.value)}
                  rows={2}
                  className={fieldClass + " resize-none md:col-span-2"}
                />
              </AdminLabel>
              <div className="flex flex-col gap-3 md:col-span-2">
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={values.isActive}
                    onChange={(e) => set("isActive", e.target.checked)}
                    className="accent-primary"
                  />
                  {t("paymentMethods.form.isActive")}
                </label>
                <label className="flex items-center gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={values.isDefault}
                    onChange={(e) => set("isDefault", e.target.checked)}
                    className="accent-primary"
                  />
                  {t("paymentMethods.form.isDefault")}
                </label>
              </div>
              <div className="flex gap-3 md:col-span-2">
                <AdminButton type="submit" variant="primary" disabled={pending}>
                  {pending ? t("common.saving") : t("paymentMethods.form.submit")}
                </AdminButton>
                <AdminButton
                  type="button"
                  variant="outline"
                  onClick={closeForm}
                >
                  {t("common.cancel")}
                </AdminButton>
              </div>
            </form>
          </AdminCard>
        )}
      </AdminSection>

      <AdminSection>
        <AdminCard className="p-0">
          <table className="w-full text-sm">
            <thead className="border-border/60 border-b text-left">
              <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                <th>{t("paymentMethods.table.label")}</th>
                <th>{t("paymentMethods.table.bank")}</th>
                <th>{t("paymentMethods.table.iban")}</th>
                <th>{t("paymentMethods.table.status")}</th>
                <th className="w-40 text-right">
                  {t("paymentMethods.table.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {methods.map((m) => (
                <tr key={m.id} className="hover:bg-muted/40">
                  <td className="px-6 py-4">
                    <div className="text-primary font-medium">{m.label}</div>
                    {m.holder && (
                      <div className="text-secondary text-xs">{m.holder}</div>
                    )}
                  </td>
                  <td className="text-secondary px-6 py-4 text-xs">
                    {m.bank_name}
                    {m.bic && (
                      <div className="font-mono">{m.bic}</div>
                    )}
                  </td>
                  <td className="text-secondary px-6 py-4 font-mono text-xs">
                    {m.iban}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1.5">
                      {m.is_default && (
                        <span className="bg-accent/15 text-accent inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                          <Star className="size-3" /> {t("paymentMethods.status.default")}
                        </span>
                      )}
                      <span
                        className={cn(
                          "rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]",
                          m.is_active
                            ? "bg-primary/10 text-primary"
                            : "bg-muted text-secondary",
                        )}
                      >
                        {m.is_active
                          ? t("paymentMethods.status.active")
                          : t("paymentMethods.status.inactive")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      {!m.is_default && m.is_active && (
                        <button
                          onClick={() => makeDefault(m.id)}
                          title={t("paymentMethods.setDefault")}
                          className="text-secondary hover:text-primary rounded-full p-1"
                        >
                          <Star className="size-3.5" />
                        </button>
                      )}
                      <button
                        onClick={() => toggle(m)}
                        title={
                          m.is_active
                            ? t("paymentMethods.deactivate")
                            : t("paymentMethods.activate")
                        }
                        className="text-secondary hover:text-primary rounded-full p-1"
                      >
                        {m.is_active ? (
                          <ToggleRight className="size-3.5" />
                        ) : (
                          <ToggleLeft className="size-3.5" />
                        )}
                      </button>
                      <button
                        onClick={() => openEdit(m)}
                        className="text-primary text-xs underline underline-offset-4"
                      >
                        {t("common.edit")}
                      </button>
                      <button
                        onClick={() => remove(m.id)}
                        title={t("common.delete")}
                        className="text-secondary hover:text-accent rounded-full p-1"
                      >
                        <Trash2 className="size-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {methods.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-secondary p-12 text-center text-sm"
                  >
                    {t("paymentMethods.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </AdminCard>
      </AdminSection>
    </>
  );
}
