import { notFound } from "next/navigation";
import { AdminHeader } from "@/features/admin/admin-ui";
import { InvoiceForm } from "@/features/admin/invoice-form";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { getT } from "@/lib/admin-i18n";

async function load(id: string) {
  const [invRes, itemsRes] = await Promise.all([
    insforgeAdmin.database.from("invoices").select("*").eq("id", id).limit(1),
    insforgeAdmin.database
      .from("invoice_items")
      .select("*")
      .eq("invoice_id", id)
      .order("sort_order", { ascending: true }),
  ]);
  const inv = ((invRes.data ?? [])[0] ?? null) as {
    id: string;
    invoice_number: string;
    order_id: string | null;
    status: "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
    customer_name: string;
    customer_email: string | null;
    customer_phone: string | null;
    customer_address: string | null;
    customer_postal: string | null;
    customer_city: string | null;
    customer_country: string | null;
    issued_at: string;
    due_at: string | null;
    currency: string;
    vat_rate_percent: number;
    notes: string | null;
    terms: string | null;
    footer: string | null;
  } | null;
  if (!inv) return null;
  const items = (itemsRes.data ?? []).map(
    (r: {
      description: string;
      sku: string | null;
      unit_price_cents: number;
      quantity: number;
    }) => ({
      description: r.description,
      sku: r.sku ?? "",
      unitPriceCents: r.unit_price_cents,
      quantity: r.quantity,
    }),
  );
  return { inv, items };
}

export default async function EditInvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, { t }] = await Promise.all([load(id), getT()]);
  if (!data) notFound();
  const { inv, items } = data;
  return (
    <>
      <AdminHeader
        title={inv.invoice_number}
        subtitle={t("invoices.editTitle")}
      />
      <InvoiceForm
        invoiceId={inv.id}
        initial={{
          invoiceNumber: inv.invoice_number,
          orderId: inv.order_id,
          status: inv.status,
          customerName: inv.customer_name,
          customerEmail: inv.customer_email ?? "",
          customerPhone: inv.customer_phone ?? "",
          customerAddress: inv.customer_address ?? "",
          customerPostal: inv.customer_postal ?? "",
          customerCity: inv.customer_city ?? "",
          customerCountry: inv.customer_country ?? "FR",
          issuedAt: inv.issued_at,
          dueAt: inv.due_at ?? "",
          currency: inv.currency,
          vatRatePercent: Number(inv.vat_rate_percent),
          notes: inv.notes ?? "",
          terms: inv.terms ?? "",
          footer: inv.footer ?? "",
          items,
        }}
      />
    </>
  );
}
