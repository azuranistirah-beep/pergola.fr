"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { execute, insertOne, toSqlDate, updateWhere } from "@/lib/db";
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
  await insertOne("admin_users", {
    id: randomUUID(),
    email,
    name,
    password_hash,
    // is_active + created_at default in the schema; specify neither so we
    // inherit the CURRENT_TIMESTAMP(6) / DEFAULT true from CREATE TABLE.
  });
  revalidatePath("/admin/users");
}

export async function resetAdminPassword(id: string, newPassword: string) {
  await requireAdmin();
  if (newPassword.length < 10)
    throw new Error("Password must be at least 10 characters");
  const password_hash = await hashPassword(newPassword);
  await updateWhere("admin_users", { password_hash }, "id = ?", [id]);
  revalidatePath("/admin/users");
}

export async function setAdminActive(id: string, active: boolean) {
  const currentUser = await requireAdmin();
  if (id === currentUser.id && !active) {
    throw new Error("You cannot deactivate your own account.");
  }
  await updateWhere(
    "admin_users",
    { is_active: active ? 1 : 0 },
    "id = ?",
    [id],
  );
  revalidatePath("/admin/users");
}

export async function deleteAdminUser(id: string) {
  const currentUser = await requireAdmin();
  if (id === currentUser.id) {
    throw new Error("You cannot delete your own account.");
  }
  await execute("DELETE FROM admin_users WHERE id = ?", [id]);
  revalidatePath("/admin/users");
}

// toSqlDate re-exported for symmetry with the other action files that need it;
// keeping the import stable prevents an unused-import lint here.
void toSqlDate;
