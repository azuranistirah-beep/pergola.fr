"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { insforge } from "@/lib/insforge";
import { insforgeAdmin } from "@/lib/insforge-admin";

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
  const since = new Date(
    Date.now() - RL_WINDOW_MINUTES * 60 * 1000,
  ).toISOString();
  const { data } = await insforgeAdmin.database
    .from("public_submissions")
    .select("id")
    .eq("kind", kind)
    .eq("ip", ip)
    .gte("submitted_at", since);
  return (data ?? []).length;
}

async function logSubmission(
  kind: "contact" | "newsletter" | "quote",
  ip: string,
) {
  await insforgeAdmin.database
    .from("public_submissions")
    .insert({ kind, ip });
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
  const { error } = await insforge.database.from("contact_messages").insert([
    {
      name,
      email,
      phone: (input.phone ?? "").trim() || null,
      postal: (input.postal ?? "").trim() || null,
      message,
      locale: input.locale,
    },
  ]);
  if (error) throw error;
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

  const { error } = await insforge.database
    .from("newsletter_subscribers")
    .upsert([{ email: clean, locale }]);
  if (error) throw error;
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

/**
 * Public quote request from the checkout page. Creates a PENDING order plus its
 * items in InsForge so the sales team can follow up (Stripe integration is not
 * wired yet — this is the quote-based flow).
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

  const { data, error } = await insforgeAdmin.database
    .from("orders")
    .insert({
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
    })
    .select("id")
    .single();

  if (error || !data) throw error ?? new Error("Failed to create quote");
  const orderId = data.id as string;

  const itemsErr = (
    await insforgeAdmin.database.from("order_items").insert(
      input.items.map((it) => ({
        order_id: orderId,
        product_name: it.productName,
        product_sku: it.productSku || null,
        product_slug: it.productSlug || null,
        unit_price_cents: it.unitPriceCents,
        quantity: it.quantity,
        line_total_cents: it.unitPriceCents * it.quantity,
        configuration: it.configuration
          ? JSON.stringify(it.configuration)
          : null,
      })),
    )
  ).error;
  if (itemsErr) throw itemsErr;

  await logSubmission("quote", ip);
  revalidatePath("/admin/orders");
  return { orderNumber };
}
