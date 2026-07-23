"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { insforge } from "@/lib/insforge";
import { insforgeAdmin } from "@/lib/insforge-admin";

const RL_WINDOW_MINUTES = 10;
const RL_MAX = { contact: 3, newsletter: 5 } as const;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

async function recentCount(kind: "contact" | "newsletter", ip: string) {
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

async function logSubmission(kind: "contact" | "newsletter", ip: string) {
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
