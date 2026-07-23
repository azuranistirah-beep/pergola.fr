"use server";

import { revalidatePath } from "next/cache";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { upsertSetting } from "@/repositories/settings-repository";

export async function updateContactStatus(
  id: string,
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED",
) {
  await insforgeAdmin.database
    .from("contact_messages")
    .update({ status })
    .eq("id", id);
  revalidatePath("/admin/inbox");
}

export async function deleteContact(id: string) {
  await insforgeAdmin.database.from("contact_messages").delete().eq("id", id);
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
  await insforgeAdmin.database
    .from("newsletter_subscribers")
    .update({ unsubscribed_at: new Date().toISOString() })
    .eq("email", email);
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
