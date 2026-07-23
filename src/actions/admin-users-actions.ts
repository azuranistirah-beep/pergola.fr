"use server";

import { revalidatePath } from "next/cache";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { hashPassword, requireAdmin } from "@/lib/admin-auth";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export async function createAdminUser(input: {
  email: string;
  name: string;
  password: string;
}) {
  await requireAdmin();
  const email = input.email.trim().toLowerCase();
  const name = input.name.trim();
  if (!EMAIL_RE.test(email)) throw new Error("Invalid email");
  if (name.length < 2) throw new Error("Name too short");
  if (input.password.length < 10)
    throw new Error("Password must be at least 10 characters");
  const password_hash = await hashPassword(input.password);
  const { error } = await insforgeAdmin.database
    .from("admin_users")
    .insert({ email, name, password_hash });
  if (error) throw error;
  revalidatePath("/admin/users");
}

export async function resetAdminPassword(id: string, newPassword: string) {
  await requireAdmin();
  if (newPassword.length < 10)
    throw new Error("Password must be at least 10 characters");
  const password_hash = await hashPassword(newPassword);
  await insforgeAdmin.database
    .from("admin_users")
    .update({ password_hash })
    .eq("id", id);
  revalidatePath("/admin/users");
}

export async function setAdminActive(id: string, active: boolean) {
  const currentUser = await requireAdmin();
  if (id === currentUser.id && !active) {
    throw new Error("You cannot deactivate your own account.");
  }
  await insforgeAdmin.database
    .from("admin_users")
    .update({ is_active: active })
    .eq("id", id);
  revalidatePath("/admin/users");
}

export async function deleteAdminUser(id: string) {
  const currentUser = await requireAdmin();
  if (id === currentUser.id) {
    throw new Error("You cannot delete your own account.");
  }
  await insforgeAdmin.database.from("admin_users").delete().eq("id", id);
  revalidatePath("/admin/users");
}
