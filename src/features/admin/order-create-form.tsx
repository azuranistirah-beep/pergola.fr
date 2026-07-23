"use client";

import * as React from "react";
import { toast } from "sonner";
import { Plus, Trash2 } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminSection,
  fieldClass,
} from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import { createManualOrder } from "@/actions/admin-orders-actions";
import { formatEUR } from "@/lib/utils";

interface ProductOption {
  id: string;
  label: string;
  sku: string;
  slug: string;
  priceCents: number;
}

interface Line {
  key: string;
  productId?: string;
  productName: string;
  productSku?: string;
  productSlug?: string;
  unitPriceEur: string;
  quantity: string;
}

function newLine(): Line {
  return {
    key: Math.random().toString(36).slice(2),
    productName: "",
    unitPriceEur: "0",
    quantity: "1",
  };
}

export function OrderCreateForm({ products }: { products: ProductOption[] }) {
  const { t } = useAdminT();
  const [customer, setCustomer] = React.useState({
    name: "",
    email: "",
    phone: "",
  });
  const [ship, setShip] = React.useState({
    address: "",
    postal: "",
    city: "",
    country: "FR",
  });
  const [notes, setNotes] = React.useState("");
  const [lines, setLines] = React.useState<Line[]>([newLine()]);
  const [pending, setPending] = React.useState(false);

  const setLine = (idx: number, patch: Partial<Line>) =>
    setLines((prev) =>
      prev.map((l, i) => (i === idx ? { ...l, ...patch } : l)),
    );

  const pickProduct = (idx: number, productId: string) => {
    const p = products.find((x) => x.id === productId);
    if (!p) {
      setLine(idx, { productId: undefined });
      return;
    }
    setLine(idx, {
      productId: p.id,
      productName: p.label,
      productSku: p.sku,
      productSlug: p.slug,
      unitPriceEur: (p.priceCents / 100).toFixed(2),
    });
  };

  const total = lines.reduce(
    (s, l) => s + Math.round(Number(l.unitPriceEur) * 100) * Number(l.quantity || 0),
    0,
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validLines = lines.filter((l) => l.productName.trim() && Number(l.quantity) > 0);
    if (!validLines.length) {
      toast.error(t("orderCreate.needOneItem"));
      return;
    }
    setPending(true);
    try {
      await createManualOrder({
        customerName: customer.name,
        customerEmail: customer.email,
        customerPhone: customer.phone || undefined,
        shippingAddress: ship.address || undefined,
        shippingPostal: ship.postal || undefined,
        shippingCity: ship.city || undefined,
        shippingCountry: ship.country || undefined,
        notes: notes || undefined,
        items: validLines.map((l) => ({
          productId: l.productId,
          productName: l.productName,
          productSku: l.productSku,
          productSlug: l.productSlug,
          unitPriceCents: Math.round(Number(l.unitPriceEur) * 100),
          quantity: Number(l.quantity),
        })),
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("NEXT_REDIRECT")) {
        toast.error(t("common.error"), { description: msg });
      }
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AdminSection title={t("orderCreate.customer")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-3">
            <AdminLabel label={t("orderCreate.name")}>
              <input
                required
                value={customer.name}
                onChange={(e) =>
                  setCustomer((p) => ({ ...p, name: e.target.value }))
                }
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("orderCreate.email")}>
              <input
                required
                type="email"
                value={customer.email}
                onChange={(e) =>
                  setCustomer((p) => ({ ...p, email: e.target.value }))
                }
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("orderCreate.phone")}>
              <input
                value={customer.phone}
                onChange={(e) =>
                  setCustomer((p) => ({ ...p, phone: e.target.value }))
                }
                className={fieldClass}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title={t("orderCreate.shipping")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-4">
            <AdminLabel label={t("orderCreate.address")}>
              <input
                value={ship.address}
                onChange={(e) =>
                  setShip((p) => ({ ...p, address: e.target.value }))
                }
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("orderCreate.postal")}>
              <input
                value={ship.postal}
                onChange={(e) =>
                  setShip((p) => ({ ...p, postal: e.target.value }))
                }
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("orderCreate.city")}>
              <input
                value={ship.city}
                onChange={(e) =>
                  setShip((p) => ({ ...p, city: e.target.value }))
                }
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("orderCreate.country")}>
              <input
                value={ship.country}
                onChange={(e) =>
                  setShip((p) => ({ ...p, country: e.target.value }))
                }
                className={fieldClass}
              />
            </AdminLabel>
          </div>
          <div className="mt-4">
            <AdminLabel label={t("orderCreate.notes")}>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={2}
                className={fieldClass + " w-full resize-none"}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title={t("orderCreate.items")}>
        <AdminCard>
          <div className="space-y-4">
            {lines.map((l, idx) => (
              <div
                key={l.key}
                className="border-border/60 grid gap-3 rounded-2xl border p-4 md:grid-cols-[2fr_1fr_1fr_1fr_auto]"
              >
                <AdminLabel label={t("orderCreate.pickProduct")}>
                  <select
                    value={l.productId ?? ""}
                    onChange={(e) => pickProduct(idx, e.target.value)}
                    className={fieldClass}
                  >
                    <option value="">— {t("orderCreate.customLine")} —</option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.label} · {formatEUR(p.priceCents)}
                      </option>
                    ))}
                  </select>
                  {!l.productId && (
                    <input
                      placeholder={t("orderCreate.productName")}
                      value={l.productName}
                      onChange={(e) =>
                        setLine(idx, { productName: e.target.value })
                      }
                      className={fieldClass + " mt-2"}
                    />
                  )}
                </AdminLabel>
                <AdminLabel label={t("orderCreate.unitPrice")}>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={l.unitPriceEur}
                    onChange={(e) => setLine(idx, { unitPriceEur: e.target.value })}
                    className={fieldClass}
                  />
                </AdminLabel>
                <AdminLabel label={t("orderCreate.qty")}>
                  <input
                    type="number"
                    min={1}
                    step={1}
                    value={l.quantity}
                    onChange={(e) => setLine(idx, { quantity: e.target.value })}
                    className={fieldClass}
                  />
                </AdminLabel>
                <AdminLabel label={t("orderDetail.lineTotal")}>
                  <div className="text-primary font-mono text-sm">
                    {formatEUR(
                      Math.round(Number(l.unitPriceEur) * 100) *
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
                    className="text-secondary hover:text-accent disabled:opacity-30 inline-flex items-center gap-1 rounded-full border border-transparent px-3 py-2 text-xs"
                  >
                    <Trash2 className="size-3.5" /> {t("orderCreate.remove")}
                  </button>
                </div>
              </div>
            ))}
            <AdminButton
              type="button"
              variant="outline"
              onClick={() => setLines((prev) => [...prev, newLine()])}
            >
              <Plus className="size-4" /> {t("orderCreate.addLine")}
            </AdminButton>
          </div>
        </AdminCard>
      </AdminSection>

      <div className="border-border/60 sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 p-8 backdrop-blur">
        <div className="text-primary font-mono text-lg">
          {t("invoice.total")}: {formatEUR(total)}
        </div>
        <AdminButton type="submit" variant="primary" disabled={pending}>
          {pending ? t("orderCreate.submitting") : t("orderCreate.submit")}
        </AdminButton>
      </div>
    </form>
  );
}
