"use client";

import { toast } from "sonner";
import { updateOrderStatus } from "@/actions/admin-inbox-actions";

const statuses = [
  "PENDING",
  "PAID",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
  "REFUNDED",
] as const;

const labels: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En atelier",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

export function OrderStatusSelect({
  id,
  current,
}: {
  id: string;
  current: string;
}) {
  return (
    <select
      value={current}
      onChange={async (e) => {
        const next = e.target.value as (typeof statuses)[number];
        try {
          await updateOrderStatus(id, next);
          toast.success("Statut mis à jour");
        } catch (err) {
          toast.error("Erreur", {
            description: err instanceof Error ? err.message : String(err),
          });
        }
      }}
      className="border-border focus:border-primary rounded-full border bg-transparent px-3 py-1 text-xs outline-none"
    >
      {statuses.map((s) => (
        <option key={s} value={s}>
          {labels[s]}
        </option>
      ))}
    </select>
  );
}
