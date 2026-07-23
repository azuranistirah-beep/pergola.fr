"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { insforgeAdmin } from "@/lib/insforge-admin";

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
  const { data } = await insforgeAdmin.database
    .from("orders")
    .select("order_number")
    .order("created_at", { ascending: false })
    .limit(1);
  const last = (data ?? [])[0]?.order_number as string | undefined;
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

  const { data, error } = await insforgeAdmin.database
    .from("orders")
    .insert({
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
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create order");
  const orderId = data.id as string;

  await insforgeAdmin.database.from("order_items").insert(
    input.items.map((it) => ({
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
  const { data: items } = await insforgeAdmin.database
    .from("order_items")
    .select("product_id, quantity")
    .eq("order_id", orderId);
  for (const it of items ?? []) {
    if (!it.product_id) continue;
    const { data: rows } = await insforgeAdmin.database
      .from("products")
      .select("stock")
      .eq("id", it.product_id)
      .limit(1);
    const current = (rows ?? [])[0]?.stock ?? 0;
    const next = Math.max(0, current - (it.quantity ?? 0));
    await insforgeAdmin.database
      .from("products")
      .update({ stock: next })
      .eq("id", it.product_id);
  }
}

export async function updateOrderStatusFull(id: string, next: OrderStatus) {
  const { data: rows } = await insforgeAdmin.database
    .from("orders")
    .select("status")
    .eq("id", id)
    .limit(1);
  const prev = ((rows ?? [])[0]?.status as OrderStatus | undefined) ?? undefined;

  const now = new Date().toISOString();
  const patch: Record<string, string | null> = { status: next };
  if (next === "PAID" && !["PAID", "PROCESSING", "SHIPPED", "DELIVERED"].includes(prev ?? "")) {
    patch.paid_at = now;
  }
  if (next === "SHIPPED") patch.shipped_at = now;
  if (next === "DELIVERED") patch.delivered_at = now;

  await insforgeAdmin.database.from("orders").update(patch).eq("id", id);

  const paidLike = new Set<OrderStatus>(["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]);
  if (paidLike.has(next) && (!prev || !paidLike.has(prev))) {
    await decrementStock(id);
  }

  revalidatePath("/admin/orders");
  revalidatePath(`/admin/orders/${id}`);
}

export async function deleteOrder(id: string) {
  await insforgeAdmin.database.from("orders").delete().eq("id", id);
  revalidatePath("/admin/orders");
  redirect("/admin/orders");
}

export async function resetOrdersInRange(
  fromIso: string | null,
  toIso: string | null,
): Promise<number> {
  let q = insforgeAdmin.database.from("orders").select("id");
  if (fromIso) q = q.gte("created_at", fromIso);
  if (toIso) q = q.lt("created_at", toIso);
  const { data } = await q;
  const ids = (data ?? []).map((r) => r.id as string);
  if (!ids.length) return 0;
  await insforgeAdmin.database.from("orders").delete().in("id", ids);
  revalidatePath("/admin/orders");
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
  const { data } = await insforgeAdmin.database
    .from("orders")
    .select("invoice_number")
    .not("invoice_number", "is", null)
    .order("invoice_number", { ascending: false })
    .limit(50);
  let maxSeq = 0;
  for (const row of data ?? []) {
    const v = row.invoice_number as string | null;
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
  const { data } = await insforgeAdmin.database
    .from("orders")
    .select("invoice_number, invoice_issued_at")
    .eq("id", orderId)
    .limit(1);
  const row = (data ?? [])[0] as
    | { invoice_number: string | null; invoice_issued_at: string | null }
    | undefined;
  if (row?.invoice_number && row.invoice_issued_at) {
    return { invoiceNumber: row.invoice_number, issuedAt: row.invoice_issued_at };
  }
  const invoiceNumber = await nextInvoiceNumber(prefix);
  const issuedAt = new Date().toISOString();
  await insforgeAdmin.database
    .from("orders")
    .update({ invoice_number: invoiceNumber, invoice_issued_at: issuedAt })
    .eq("id", orderId);
  return { invoiceNumber, issuedAt };
}

