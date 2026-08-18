import { notFound } from "next/navigation";
import { AdminHeader } from "@/features/admin/admin-ui";
import { InvoiceForm } from "@/features/admin/invoice-form";
import { query, queryOne } from "@/lib/db";
import { getT } from "@/lib/admin-i18n";

interface InvRow {
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
}

async function load(id: string) {
  const [inv, rawItems] = await Promise.all([
    queryOne<InvRow>("SELECT * FROM invoices WHERE id = ? LIMIT 1", [id]),
    query<{
      description: string;
      sku: string | null;
      unit_price_cents: number;
      quantity: number;
    }>(
      "SELECT description, sku, unit_price_cents, quantity FROM invoice_items " +
        "WHERE invoice_id = ? ORDER BY sort_order ASC",
      [id],
    ),
  ]);
  if (!inv) return null;
  const items = rawItems.map((r) => ({
    description: r.description,
    sku: r.sku ?? "",
    unitPriceCents: r.unit_price_cents,
    quantity: r.quantity,
  }));
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
