"use server";

import { insforge } from "@/lib/insforge";
import { revalidatePath } from "next/cache";

export async function submitContactMessage(input: {
  name: string;
  email: string;
  phone?: string;
  postal?: string;
  message: string;
  locale: string;
}) {
  const { error } = await insforge.database.from("contact_messages").insert([
    {
      name: input.name,
      email: input.email,
      phone: input.phone || null,
      postal: input.postal || null,
      message: input.message,
      locale: input.locale,
    },
  ]);
  if (error) throw error;
  revalidatePath("/admin/inbox");
}

export async function subscribeNewsletter(email: string, locale: string) {
  const { error } = await insforge.database
    .from("newsletter_subscribers")
    .upsert([{ email, locale }]);
  if (error) throw error;
  revalidatePath("/admin/newsletter");
}
