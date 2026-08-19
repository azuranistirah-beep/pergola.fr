"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import {
  execute,
  insertMany,
  insertOne,
  query,
  queryOne,
  toSqlDate,
  updateWhere,
} from "@/lib/db";

type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELLED"
  | "REFUNDED";

interface ManualOrderItemInput {
  productId?: string;
  productName: string;
  productSku?: string;
  productSlug?: string;
  unitPriceCents: number;
  quantity: number;
}

interface ManualOrderInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingPostal?: string;
  shippingCity?: string;
  shippingCountry?: string;
  notes?: string;
  items: ManualOrderItemInput[];
}

async function nextOrderNumber(): Promise<string> {
  const row = await queryOne<{ order_number: string }>(
    "SELECT order_number FROM orders ORDER BY created_at DESC LIMIT 1",
  );
  const last = row?.order_number;
  const year = new Date().getUTCFullYear();
  if (last && last.startsWith(`PGL-${year}-`)) {
    const seq = Number(last.split("-").pop() ?? "0") + 1;
    return `PGL-${year}-${String(seq).padStart(5, "0")}`;
  }
  return `PGL-${year}-00001`;
}

export async function createManualOrder(input: ManualOrderInput) {
  if (!input.items.length) throw new Error("Order must have at least one item");
  const orderNumber = await nextOrderNumber();
  const total = input.items.reduce(
    (s, it) => s + it.unitPriceCents * it.quantity,
    0,
  );
  const itemsCount = input.items.reduce((s, it) => s + it.quantity, 0);

  // We generate the id client-side (was `gen_random_uuid()` in Postgres) so
  // we can INSERT children with a known FK in the same request.
  const { randomUUID } = await import("node:crypto");
  const orderId = randomUUID();

  await insertOne("orders", {
    id: orderId,
    order_number: orderNumber,
    customer_name: input.customerName,
    customer_email: input.customerEmail,
    customer_phone: input.customerPhone ?? null,
    shipping_address: input.shippingAddress ?? null,
    shipping_postal: input.shippingPostal ?? null,
    shipping_city: input.shippingCity ?? null,
    shipping_country: input.shippingCountry ?? "FR",
    notes: input.notes ?? null,
    status: "PENDING",
    total_cents: total,
    items_count: itemsCount,
    currency: "EUR",
  });

  await insertMany(
    "order_items",
    input.items.map((it) => ({
      id: randomUUID(),
      order_id: orderId,
      product_id: it.productId ?? null,
      product_name: it.productName,
      product_sku: it.productSku ?? null,
      product_slug: it.productSlug ?? null,
      unit_price_cents: it.unitPriceCents,
      quantity: it.quantity,
      line_total_cents: it.unitPriceCents * it.quantity,
    })),
  );

  revalidatePath("/admin/orders");
  redirect(`/admin/orders/${orderId}`);
}

async function decrementStock(orderId: string) {
  const items = await query<{ product_id: string | null; quantity: number }>(
    "SELECT product_id, quantity FROM order_items WHERE order_id = ?",
    [orderId],
  );
  for (const it of items) {
    if (!it.product_id) continue;
    // One atomic UPDATE beats read + write and dodges the lost-update race.
    await execute(
      "UPDATE products SET stock = GREATEST(0, stock - ?) WHERE id = ?",
      [it.quantity ?? 0, it.product_id],
    );
  }
}

export async function updateOrderStatusFull(id: string, next: OrderStatus) {
  const row = await queryOne<{ status: OrderStatus }>(
    "SELECT status FROM orders WHERE id = ? LIMIT 1",
    [id],
  );
  const prev = row?.status;

  const now = toSqlDate();
  const patch: Record<string, string | null> = { status: next };
  if (
    next === "PAID" &&
    !["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(prev ?? "")
  ) {
    patch.paid_at = now;
  }
  if (next === "SHIPPED") patch.shipped_at = now;
  if (next === "DELIVERED") patch.delivered_at = now;

  await updateWhere("orders", patch, "id = ?", [id]);

  const paidLike = new Set<OrderStatus>([
    "PAID",
    "PROCESSING",
    "SHIPPED",
    "DELIVERED",
  ]);
  if (paidLike.has(next) && (!prev || !paidLike.has(prev))) {
    await decrementStock(id);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function deleteOrder(id: string) {
  await execute("DELETE FROM orders WHERE id = ?", [id]);
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function resetOrdersInRange(
  fromIso: string | null,
  toIso: string | null,
): Promise<number> {
  const clauses: string[] = [];
  const params: unknown[] = [];
  if (fromIso) {
    clauses.push("created_at >= ?");
    params.push(toSqlDate(fromIso));
  }
  if (toIso) {
    clauses.push("created_at < ?");
    params.push(toSqlDate(toIso));
  }
  const where = clauses.length ? `WHERE ${clauses.join(" AND ")}` : "";
  const rows = await query<{ id: string }>(
    `SELECT id FROM orders ${where}`,
    params,
  );
  const ids = rows.map((r) => r.id);
  if (!ids.length) return 0;
  // `invoices.order_id` is ON DELETE SET NULL — killing the orders would leave
  // orphaned invoices/invoice_items behind. Drop the invoices first so the
  // reset actually clears everything the customer transactions produced.
  await execute("DELETE FROM invoices WHERE order_id IN (?)", [ids]);
  await execute("DELETE FROM orders WHERE id IN (?)", [ids]);
  revalidatePath("/admin/orders");
  revalidatePath("/admin/invoices");
  revalidatePath("/admin/reports");
  revalidatePath("/admin");
  return ids.length;
}

export async function resetCurrentMonth(): Promise<number> {
  const now = new Date();
  const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));
  const end = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1));
  return resetOrdersInRange(start.toISOString(), end.toISOString());
}

export async function resetAllOrders(): Promise<number> {
  return resetOrdersInRange(null, null);
}

async function nextInvoiceNumber(prefix: string): Promise<string> {
  const year = new Date().getUTCFullYear();
  const pattern = `${prefix}-${year}-`;
  const rows = await query<{ invoice_number: string | null }>(
    "SELECT invoice_number FROM orders WHERE invoice_number IS NOT NULL " +
      "ORDER BY invoice_number DESC LIMIT 50",
  );
  let maxSeq = 0;
  for (const r of rows) {
    const v = r.invoice_number;
    if (!v || !v.startsWith(pattern)) continue;
    const seq = Number(v.slice(pattern.length));
    if (Number.isFinite(seq) && seq > maxSeq) maxSeq = seq;
  }
  return `${pattern}${String(maxSeq + 1).padStart(5, "0")}`;
}

export async function ensureInvoiceNumber(
  orderId: string,
  prefix: string,
): Promise<{ invoiceNumber: string; issuedAt: string }> {
  const row = await queryOne<{
    invoice_number: string | null;
    invoice_issued_at: string | null;
  }>(
    "SELECT invoice_number, invoice_issued_at FROM orders WHERE id = ? LIMIT 1",
    [orderId],
  );
  if (row?.invoice_number && row.invoice_issued_at) {
    return { invoiceNumber: row.invoice_number, issuedAt: row.invoice_issued_at };
  }
  const invoiceNumber = await nextInvoiceNumber(prefix);
  const issuedAt = toSqlDate();
  await updateWhere(
    "orders",
    { invoice_number: invoiceNumber, invoice_issued_at: issuedAt },
    "id = ?",
    [orderId],
  );
  return { invoiceNumber, issuedAt };
}
