"use server";

import { randomUUID } from "node:crypto";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import {
  insertMany,
  insertOne,
  query,
  queryOne,
  toSqlDate,
  upsertOne,
} from "@/lib/db";

const RL_WINDOW_MINUTES = 10;
const RL_MAX = { contact: 3, newsletter: 5, quote: 3 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

async function recentCount(
  kind: "contact" | "newsletter" | "quote",
  ip: string,
) {
  const since = toSqlDate(new Date(Date.now() - RL_WINDOW_MINUTES * 60 * 1000));
  const rows = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM public_submissions " +
      "WHERE kind = ? AND ip = ? AND submitted_at >= ?",
    [kind, ip, since],
  );
  return Number(rows[0]?.n ?? 0);
}

async function logSubmission(
  kind: "contact" | "newsletter" | "quote",
  ip: string,
) {
  // `public_submissions.id` is BIGINT AUTO_INCREMENT — let the DB assign it.
  await insertOne("public_submissions", { kind, ip });
}

const RATE_LIMITED = "Too many submissions. Please try again later.";

export async function submitContactMessage(input: {
  name: string;
  email: string;
  phone?: string;
  postal?: string;
  message: string;
  locale: string;
  /** Honeypot — must be empty. */
  website?: string;
}) {
  // 1. Honeypot: bot filled the hidden field → silently accept without writing.
  if (input.website && input.website.trim() !== "") return;

  // 2. Validate.
  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const message = input.message.trim();
  if (name.length < 2) throw new Error("Name too short");
  if (!EMAIL_RE.test(email)) throw new Error("Invalid email");
  if (message.length < 10)
    throw new Error("Message too short (min 10 chars)");
  if (message.length > 5000)
    throw new Error("Message too long (max 5000 chars)");

  // 3. Rate-limit per IP.
  const ip = await clientIp();
  const count = await recentCount("contact", ip);
  if (count >= RL_MAX.contact) throw new Error(RATE_LIMITED);

  // 4. Insert + log.
  await insertOne("contact_messages", {
    id: randomUUID(),
    name,
    email,
    phone: (input.phone ?? "").trim() || null,
    postal: (input.postal ?? "").trim() || null,
    message,
    locale: input.locale,
  });
  await logSubmission("contact", ip);
  revalidatePath("/admin/inbox");
}

export async function subscribeNewsletter(
  email: string,
  locale: string,
  honeypot?: string,
) {
  if (honeypot && honeypot.trim() !== "") return;

  const clean = email.trim().toLowerCase();
  if (!EMAIL_RE.test(clean)) throw new Error("Invalid email");

  const ip = await clientIp();
  const count = await recentCount("newsletter", ip);
  if (count >= RL_MAX.newsletter) throw new Error(RATE_LIMITED);

  await upsertOne("newsletter_subscribers", { email: clean, locale });
  await logSubmission("newsletter", ip);
  revalidatePath("/admin/newsletter");
}

interface QuoteItemInput {
  productSlug: string;
  productSku: string;
  productName: string;
  unitPriceCents: number;
  quantity: number;
  configuration?: Record<string, string | number>;
}

interface QuoteRequestInput {
  customerName: string;
  customerEmail: string;
  customerPhone?: string;
  shippingAddress?: string;
  shippingPostal?: string;
  shippingCity?: string;
  shippingCountry?: string;
  notes?: string;
  locale: string;
  items: QuoteItemInput[];
  /** Honeypot — must stay empty. */
  website?: string;
}

async function nextQuoteNumber(): Promise<string> {
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

/**
 * Public quote request from the checkout page. Creates a PENDING order plus its
 * items in MySQL so the sales team can follow up. Stripe wiring is not part of
 * the quote flow yet.
 */
export async function submitQuoteRequest(
  input: QuoteRequestInput,
): Promise<{ orderNumber: string }> {
  if (input.website && input.website.trim() !== "")
    return { orderNumber: "" };

  const name = input.customerName.trim();
  const email = input.customerEmail.trim().toLowerCase();
  if (name.length < 2) throw new Error("Name too short");
  if (!EMAIL_RE.test(email)) throw new Error("Invalid email");
  if (!input.items.length) throw new Error("Cart is empty");

  const ip = await clientIp();
  const count = await recentCount("quote", ip);
  if (count >= RL_MAX.quote) throw new Error(RATE_LIMITED);

  const total = input.items.reduce(
    (s, it) => s + it.unitPriceCents * it.quantity,
    0,
  );
  const itemsCount = input.items.reduce((s, it) => s + it.quantity, 0);
  const orderNumber = await nextQuoteNumber();
  const orderId = randomUUID();

  await insertOne("orders", {
    id: orderId,
    order_number: orderNumber,
    customer_name: name,
    customer_email: email,
    customer_phone: (input.customerPhone ?? "").trim() || null,
    shipping_address: (input.shippingAddress ?? "").trim() || null,
    shipping_postal: (input.shippingPostal ?? "").trim() || null,
    shipping_city: (input.shippingCity ?? "").trim() || null,
    shipping_country: (input.shippingCountry ?? "").trim() || "FR",
    notes: (input.notes ?? "").trim() || null,
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
      product_name: it.productName,
      product_sku: it.productSku || null,
      product_slug: it.productSlug || null,
      unit_price_cents: it.unitPriceCents,
      quantity: it.quantity,
      line_total_cents: it.unitPriceCents * it.quantity,
      // order_items has no `configuration` column in the current schema;
      // stash it into `product_name` or drop it. Original code assigned to
      // a column that doesn't exist — we drop it here to match the schema.
    })),
  );

  await logSubmission("quote", ip);
  revalidatePath("/admin/orders");
  return { orderNumber };
}
