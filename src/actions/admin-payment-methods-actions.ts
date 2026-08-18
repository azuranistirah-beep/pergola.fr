"use server";

import { randomUUID } from "node:crypto";
import { revalidatePath } from "next/cache";
import { execute, insertOne, toSqlDate, updateWhere } from "@/lib/db";
import { requireAdmin } from "@/lib/admin-auth";

export interface PaymentMethodInput {
  label: string;
  holder?: string;
  bankName?: string;
  iban?: string;
  bic?: string;
  notes?: string;
  isActive: boolean;
  isDefault: boolean;
  sortOrder: number;
}

function normalise(input: PaymentMethodInput) {
  const clean = (s?: string) => (s ?? "").trim() || null;
  return {
    label: input.label.trim(),
    holder: clean(input.holder),
    bank_name: clean(input.bankName),
    iban: clean(input.iban)?.toUpperCase().replace(/\s+/g, ""),
    bic: clean(input.bic)?.toUpperCase().replace(/\s+/g, ""),
    notes: clean(input.notes),
    is_active: input.isActive ? 1 : 0,
    is_default: input.isDefault ? 1 : 0,
    sort_order: input.sortOrder,
  };
}

async function clearOtherDefaults(excludeId?: string) {
  if (excludeId) {
    await execute(
      "UPDATE payment_methods SET is_default = 0 WHERE is_default = 1 AND id != ?",
      [excludeId],
    );
  } else {
    await execute(
      "UPDATE payment_methods SET is_default = 0 WHERE is_default = 1",
    );
  }
}

export async function createPaymentMethod(input: PaymentMethodInput) {
  await requireAdmin();
  if (!input.label.trim()) throw new Error("Label is required");
  const payload = normalise(input);
  if (payload.is_default === 1) await clearOtherDefaults();
  const id = randomUUID();
  await insertOne("payment_methods", { id, ...payload });
  revalidatePath("/", "layout");
  return id;
}

export async function updatePaymentMethod(
  id: string,
  input: PaymentMethodInput,
) {
  await requireAdmin();
  if (!input.label.trim()) throw new Error("Label is required");
  const payload = { ...normalise(input), updated_at: toSqlDate() };
  if (payload.is_default === 1) await clearOtherDefaults(id);
  await updateWhere("payment_methods", payload, "id = ?", [id]);
  revalidatePath("/", "layout");
}

export async function deletePaymentMethod(id: string) {
  await requireAdmin();
  await execute("DELETE FROM payment_methods WHERE id = ?", [id]);
  revalidatePath("/", "layout");
}

export async function setDefaultPaymentMethod(id: string) {
  await requireAdmin();
  await clearOtherDefaults(id);
  await updateWhere(
    "payment_methods",
    { is_default: 1, is_active: 1 },
    "id = ?",
    [id],
  );
  revalidatePath("/", "layout");
}

export async function togglePaymentMethodActive(id: string, active: boolean) {
  await requireAdmin();
  const patch: Record<string, number> = { is_active: active ? 1 : 0 };
  if (!active) patch.is_default = 0;
  await updateWhere("payment_methods", patch, "id = ?", [id]);
  revalidatePath("/", "layout");
}
