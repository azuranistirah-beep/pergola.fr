"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { getSiteInfo } from "@/repositories/settings-repository";

export type InvoiceStatus = "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";

export interface InvoiceItemInput {
  description: string;
  sku?: string;
  unitPriceCents: number;
  quantity: number;
}

export interface InvoiceInput {
  invoiceNumber?: string;
  orderId?: string | null;
  status: InvoiceStatus;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  customerAddress?: string;
  customerPostal?: string;
  customerCity?: string;
  customerCountry?: string;
  issuedAt: string;
  dueAt?: string | null;
  currency?: string;
  vatRatePercent: number;
  notes?: string;
  terms?: string;
  footer?: string;
  items: InvoiceItemInput[];
}

async function nextInvoiceNumber(prefix: string): Promise<string> {
  const year = new Date().getUTCFullYear();
  const pattern = `${prefix}-${year}-`;
  const { data } = await insforgeAdmin.database
    .from("invoices")
    .select("invoice_number")
    .order("invoice_number", { ascending: false })
    .limit(100);
  let maxSeq = 0;
  for (const row of data ?? []) {
    const v = row.invoice_number as string | null;
    if (!v || !v.startsWith(pattern)) continue;
    const seq = Number(v.slice(pattern.length));
    if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
  }
  return `${pattern}${String(maxSeq + 1).padStart(5, "0")}`;
}

function computeTotals(input: InvoiceInput) {
  const subtotalHt = input.items.reduce(
    (s, it) => s + it.unitPriceCents * it.quantity,
    0,
  );
  const vat = Math.round(subtotalHt * (input.vatRatePercent / 100));
  return { subtotalHt, vat, totalTtc: subtotalHt + vat };
}

export async function createInvoice(input: InvoiceInput): Promise<string> {
  if (!input.items.length) throw new Error("Invoice must have at least one line item");
  const site = await getSiteInfo();
  const invoiceNumber =
    input.invoiceNumber?.trim() ||
    (await nextInvoiceNumber(site.invoicePrefix || "INV"));
  const { subtotalHt, vat, totalTtc } = computeTotals(input);

  const { data, error } = await insforgeAdmin.database
    .from("invoices")
    .insert({
      invoice_number: invoiceNumber,
      order_id: input.orderId ?? null,
      status: input.status,
      customer_name: input.customerName,
      customer_email: input.customerEmail ?? null,
      customer_phone: input.customerPhone ?? null,
      customer_address: input.customerAddress ?? null,
      customer_postal: input.customerPostal ?? null,
      customer_city: input.customerCity ?? null,
      customer_country: input.customerCountry ?? "FR",
      issued_at: input.issuedAt,
      due_at: input.dueAt ?? null,
      currency: input.currency ?? "EUR",
      vat_rate_percent: input.vatRatePercent,
      subtotal_ht_cents: subtotalHt,
      vat_cents: vat,
      total_ttc_cents: totalTtc,
      notes: input.notes ?? null,
      terms: input.terms ?? null,
      footer: input.footer ?? null,
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create invoice");
  const invoiceId = data.id as string;

  await insforgeAdmin.database.from("invoice_items").insert(
    input.items.map((it, idx) => ({
      invoice_id: invoiceId,
      description: it.description,
      sku: it.sku ?? null,
      unit_price_cents: it.unitPriceCents,
      quantity: it.quantity,
      line_total_cents: it.unitPriceCents * it.quantity,
      sort_order: idx,
    })),
  );

  revalidatePath("/admin/invoices");
  return invoiceId;
}

export async function updateInvoice(id: string, input: InvoiceInput) {
  if (!input.items.length)
    throw new Error("Invoice must have at least one line item");
  const { subtotalHt, vat, totalTtc } = computeTotals(input);

  const { data: existingRows } = await insforgeAdmin.database
    .from("invoices")
    .select("paid_at, invoice_number")
    .eq("id", id)
    .limit(1);
  const existing = (existingRows ?? [])[0] as
    | { paid_at: string | null; invoice_number: string }
    | undefined;
  const existingPaidAt = existing?.paid_at ?? null;
  const cleanNumber =
    (input.invoiceNumber ?? "").trim() ||
    existing?.invoice_number ||
    "";
  if (!cleanNumber) throw new Error("Invoice number is required");
  const nextPaidAt =
    input.status === "PAID"
      ? existingPaidAt ?? new Date().toISOString()
      : null;

  await insforgeAdmin.database
    .from("invoices")
    .update({
      invoice_number: cleanNumber,
      order_id: input.orderId ?? null,
      status: input.status,
      customer_name: input.customerName,
      customer_email: input.customerEmail ?? null,
      customer_phone: input.customerPhone ?? null,
      customer_address: input.customerAddress ?? null,
      customer_postal: input.customerPostal ?? null,
      customer_city: input.customerCity ?? null,
      customer_country: input.customerCountry ?? "FR",
      issued_at: input.issuedAt,
      due_at: input.dueAt ?? null,
      currency: input.currency ?? "EUR",
      vat_rate_percent: input.vatRatePercent,
      subtotal_ht_cents: subtotalHt,
      vat_cents: vat,
      total_ttc_cents: totalTtc,
      notes: input.notes ?? null,
      terms: input.terms ?? null,
      footer: input.footer ?? null,
      updated_at: new Date().toISOString(),
      paid_at: nextPaidAt,
    })
    .eq("id", id);

  await insforgeAdmin.database.from("invoice_items").delete().eq("invoice_id", id);
  await insforgeAdmin.database.from("invoice_items").insert(
    input.items.map((it, idx) => ({
      invoice_id: id,
      description: it.description,
      sku: it.sku ?? null,
      unit_price_cents: it.unitPriceCents,
      quantity: it.quantity,
      line_total_cents: it.unitPriceCents * it.quantity,
      sort_order: idx,
    })),
  );

  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
}

export async function deleteInvoice(id: string) {
  await insforgeAdmin.database.from("invoices").delete().eq("id", id);
  revalidatePath("/admin/invoices");
  redirect("/admin/invoices");
}

export async function setInvoiceStatus(id: string, status: InvoiceStatus) {
  const patch: Record<string, string | null> = { status };
  if (status === "PAID") patch.paid_at = new Date().toISOString();
  await insforgeAdmin.database.from("invoices").update(patch).eq("id", id);
  revalidatePath("/admin/invoices");
  revalidatePath(`/admin/invoices/${id}`);
}

/** Create a draft invoice from an existing order — customer & items copied. */
export async function generateInvoiceFromOrder(orderId: string): Promise<string> {
  const [orderRes, itemsRes, site] = await Promise.all([
    insforgeAdmin.database.from("orders").select("*").eq("id", orderId).limit(1),
    insforgeAdmin.database
      .from("order_items")
      .select("*")
      .eq("order_id", orderId)
      .order("created_at", { ascending: true }),
    getSiteInfo(),
  ]);
  const order = ((orderRes.data ?? [])[0] ?? null) as
    | {
        id: string;
        customer_name: string | null;
        customer_email: string | null;
        customer_phone: string | null;
        shipping_address: string | null;
        shipping_postal: string | null;
        shipping_city: string | null;
        shipping_country: string | null;
        status: string;
        total_cents: number;
      }
    | null;
  if (!order) throw new Error("Order not found");
  const items = (itemsRes.data ?? []) as {
    product_name: string;
    product_sku: string | null;
    unit_price_cents: number;
    quantity: number;
  }[];

  const vatRate = site.vatRatePercent || 0;
  // Order totals are TTC. Convert to HT for invoice line items.
  const linesHt: InvoiceItemInput[] = items.map((it) => ({
    description: it.product_name,
    sku: it.product_sku ?? undefined,
    unitPriceCents: Math.round(it.unit_price_cents / (1 + vatRate / 100)),
    quantity: it.quantity,
  }));

  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + (site.paymentTermsDays || 0));
  const paidLike = new Set(["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]);
  const status: InvoiceStatus = paidLike.has(order.status) ? "PAID" : "ISSUED";

  return createInvoice({
    orderId: order.id,
    status,
    customerName: order.customer_name ?? "—",
    customerEmail: order.customer_email ?? undefined,
    customerPhone: order.customer_phone ?? undefined,
    customerAddress: order.shipping_address ?? undefined,
    customerPostal: order.shipping_postal ?? undefined,
    customerCity: order.shipping_city ?? undefined,
    customerCountry: order.shipping_country ?? "FR",
    issuedAt: now.toISOString(),
    dueAt: due.toISOString(),
    currency: "EUR",
    vatRatePercent: vatRate,
    terms: site.paymentTerms,
    footer: site.invoiceFooter,
    items: linesHt,
  });
}

export async function generateInvoiceFromOrderAndRedirect(orderId: string) {
  const id = await generateInvoiceFromOrder(orderId);
  redirect(`/admin/invoices/${id}`);
}
