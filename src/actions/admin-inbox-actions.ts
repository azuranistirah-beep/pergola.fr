"use server";

import { revalidatePath } from "next/cache";
import { execute, toSqlDate, updateWhere } from "@/lib/db";
import { upsertSetting } from "@/repositories/settings-repository";

export async function updateContactStatus(
  id: string,
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED",
) {
  await updateWhere("contact_messages", { status }, "id = ?", [id]);
  revalidatePath("/admin/inbox");
}

export async function deleteContact(id: string) {
  await execute("DELETE FROM contact_messages WHERE id = ?", [id]);
  revalidatePath("/admin/inbox");
}

export async function updateOrderStatus(
  id: string,
  status:
    | "PENDING"
    | "PAID"
    | "PROCESSING"
    | "SHIPPED"
    | "DELIVERED"
    | "CANCELLED"
    | "REFUNDED",
) {
  const { updateOrderStatusFull } = await import("./admin-orders-actions");
  await updateOrderStatusFull(id, status);
}

export async function unsubscribeNewsletter(email: string) {
  await updateWhere(
    "newsletter_subscribers",
    { unsubscribed_at: toSqlDate() },
    "email = ?",
    [email],
  );
  revalidatePath("/admin/newsletter");
}

export async function saveContent(value: {
  heroTitleFr: string;
  heroTitleEn: string;
  heroSubtitleFr: string;
  heroSubtitleEn: string;
  heroEyebrowFr: string;
  heroEyebrowEn: string;
}) {
  await upsertSetting("content", value);
  revalidatePath("/", "layout");
}
