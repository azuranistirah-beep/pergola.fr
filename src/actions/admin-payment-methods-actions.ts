"use server";

import { revalidatePath } from "next/cache";
import { insforgeAdmin } from "@/lib/insforge-admin";
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
    is_active: input.isActive,
    is_default: input.isDefault,
    sort_order: input.sortOrder,
  };
}

async function clearOtherDefaults(excludeId?: string) {
  const q = insforgeAdmin.database
    .from("payment_methods")
    .update({ is_default: false })
    .eq("is_default", true);
  if (excludeId) q.neq("id", excludeId);
  await q;
}

export async function createPaymentMethod(input: PaymentMethodInput) {
  await requireAdmin();
  if (!input.label.trim()) throw new Error("Label is required");
  const payload = normalise(input);
  if (payload.is_default) await clearOtherDefaults();
  const { data, error } = await insforgeAdmin.database
    .from("payment_methods")
    .insert(payload)
    .select("id")
    .single();
  if (error) throw error;
  revalidatePath("/", "layout");
  return data?.id as string;
}

export async function updatePaymentMethod(id: string, input: PaymentMethodInput) {
  await requireAdmin();
  if (!input.label.trim()) throw new Error("Label is required");
  const payload = { ...normalise(input), updated_at: new Date().toISOString() };
  if (payload.is_default) await clearOtherDefaults(id);
  await insforgeAdmin.database
    .from("payment_methods")
    .update(payload)
    .eq("id", id);
  revalidatePath("/", "layout");
}

export async function deletePaymentMethod(id: string) {
  await requireAdmin();
  await insforgeAdmin.database
    .from("payment_methods")
    .delete()
    .eq("id", id);
  revalidatePath("/", "layout");
}

export async function setDefaultPaymentMethod(id: string) {
  await requireAdmin();
  await clearOtherDefaults(id);
  await insforgeAdmin.database
    .from("payment_methods")
    .update({ is_default: true, is_active: true })
    .eq("id", id);
  revalidatePath("/", "layout");
}

export async function togglePaymentMethodActive(id: string, active: boolean) {
  await requireAdmin();
  const patch: Record<string, boolean> = { is_active: active };
  if (!active) patch.is_default = false;
  await insforgeAdmin.database
    .from("payment_methods")
    .update(patch)
    .eq("id", id);
  revalidatePath("/", "layout");
}
