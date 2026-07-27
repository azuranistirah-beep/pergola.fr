import { insforge } from "@/lib/insforge";
import { insforgeAdmin } from "@/lib/insforge-admin";

export interface PaymentMethod {
  id: string;
  kind: string;
  label: string;
  holder: string | null;
  bank_name: string | null;
  iban: string | null;
  bic: string | null;
  notes: string | null;
  is_default: boolean;
  is_active: boolean;
  sort_order: number;
}

export async function listPaymentMethods(
  { adminOnly = false }: { adminOnly?: boolean } = {},
): Promise<PaymentMethod[]> {
  const db = adminOnly ? insforgeAdmin.database : insforge.database;
  const { data } = await db
    .from("payment_methods")
    .select("*")
    .order("sort_order", { ascending: true })
    .order("created_at", { ascending: true });
  return (data ?? []) as PaymentMethod[];
}

export async function getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
  const all = await listPaymentMethods({ adminOnly: true });
  return (
    all.find((m) => m.is_default && m.is_active) ??
    all.find((m) => m.is_active) ??
    null
  );
}

/**
 * Active payment methods to display to end customers on checkout / confirmation.
 * Uses the admin client so RLS never hides the list from unauthenticated
 * visitors — customers do need to see it, but only via server components.
 */
export async function listActivePaymentMethodsForCustomer(): Promise<
  PaymentMethod[]
> {
  const all = await listPaymentMethods({ adminOnly: true });
  return all
    .filter((m) => m.is_active)
    .sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return a.sort_order - b.sort_order;
    });
}
