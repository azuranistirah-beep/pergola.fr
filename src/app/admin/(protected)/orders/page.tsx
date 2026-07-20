import { Package } from "lucide-react";
import {
  AdminHeader,
  AdminSection,
  KpiCard,
} from "@/features/admin/admin-ui";
import { OrderStatusSelect } from "@/features/admin/order-status-select";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { formatEUR } from "@/lib/utils";

interface Order {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  status: string;
  total_cents: number;
  items_count: number;
  created_at: string;
}

const tone: Record<string, string> = {
  PENDING: "bg-muted text-secondary",
  PAID: "bg-primary/10 text-primary",
  PROCESSING: "bg-accent/15 text-accent",
  SHIPPED: "bg-accent/15 text-accent",
  DELIVERED: "bg-primary/10 text-primary",
  CANCELLED: "bg-muted text-secondary",
  REFUNDED: "bg-muted text-secondary",
};

const label: Record<string, string> = {
  PENDING: "En attente",
  PAID: "Payée",
  PROCESSING: "En atelier",
  SHIPPED: "Expédiée",
  DELIVERED: "Livrée",
  CANCELLED: "Annulée",
  REFUNDED: "Remboursée",
};

async function load() {
  const { data } = await insforgeAdmin.database
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Order[];
}

export default async function OrdersPage() {
  const orders = await load();
  const revenue = orders
    .filter((o) => o.status !== "CANCELLED" && o.status !== "REFUNDED")
    .reduce((s, o) => s + o.total_cents, 0);
  const pending = orders.filter((o) => o.status === "PENDING").length;
  const processing = orders.filter(
    (o) => o.status === "PROCESSING" || o.status === "PAID",
  ).length;

  return (
    <>
      <AdminHeader
        title="Commandes"
        subtitle="Suivi de production et de livraison"
      />

      <AdminSection>
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label="Commandes" value={orders.length} Icon={Package} />
          <KpiCard label="CA cumulé" value={formatEUR(revenue)} />
          <KpiCard label="En attente" value={pending} hint="Paiement à venir" />
          <KpiCard label="En atelier" value={processing} />
        </div>
      </AdminSection>

      <AdminSection>
        <div className="bg-background border-border/60 overflow-hidden rounded-3xl border">
          <table className="w-full text-sm">
            <thead className="border-border/60 border-b text-left">
              <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                <th>Référence</th>
                <th>Client</th>
                <th className="text-right">Articles</th>
                <th className="text-right">Total</th>
                <th>Date</th>
                <th>Statut</th>
                <th className="w-40 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {orders.map((o) => (
                <tr key={o.id} className="hover:bg-muted/40">
                  <td className="text-primary px-6 py-4 font-mono text-xs">
                    {o.order_number}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-primary font-medium">
                      {o.customer_name}
                    </div>
                    <div className="text-secondary text-xs">
                      {o.customer_email}
                    </div>
                  </td>
                  <td className="text-right px-6 py-4 font-mono">
                    {o.items_count}
                  </td>
                  <td className="text-right px-6 py-4 font-mono">
                    {formatEUR(o.total_cents)}
                  </td>
                  <td className="text-secondary px-6 py-4 text-xs">
                    {new Date(o.created_at).toLocaleDateString("fr-FR", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] ${tone[o.status]}`}
                    >
                      {label[o.status] ?? o.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <OrderStatusSelect id={o.id} current={o.status} />
                  </td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr>
                  <td
                    colSpan={7}
                    className="text-secondary p-12 text-center text-sm"
                  >
                    Aucune commande pour l&apos;instant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminSection>
    </>
  );
}
