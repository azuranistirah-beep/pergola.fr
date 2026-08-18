import { query } from "@/lib/db";

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

interface PaymentMethodRow {
  id: string;
  kind: string;
  label: string;
  holder: string | null;
  bank_name: string | null;
  iban: string | null;
  bic: string | null;
  notes: string | null;
  is_default: number; // MySQL TINYINT(1)
  is_active: number;
  sort_order: number;
}

function rowToMethod(r: PaymentMethodRow): PaymentMethod {
  return {
    id: r.id,
    kind: r.kind,
    label: r.label,
    holder: r.holder,
    bank_name: r.bank_name,
    iban: r.iban,
    bic: r.bic,
    notes: r.notes,
    is_default: r.is_default === 1,
    is_active: r.is_active === 1,
    sort_order: r.sort_order,
  };
}

// The old `{ adminOnly }` flag was there because InsForge RLS hid rows from
// anonymous clients — MySQL has no RLS, so every caller just runs the same
// query. Kept the signature so callers don't need to change.
export async function listPaymentMethods(
  _opts: { adminOnly?: boolean } = {},
): Promise<PaymentMethod[]> {
  // Graceful fallback when the DB is unreachable (build-time prerender or
  // transient outage) — no payment methods rather than a 500.
  try {
    const rows = await query<PaymentMethodRow>(
      "SELECT * FROM payment_methods ORDER BY sort_order ASC, created_at ASC",
    );
    return rows.map(rowToMethod);
  } catch (err) {
    console.warn(
      "[payment-methods-repository] DB read failed, returning empty:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

export async function getDefaultPaymentMethod(): Promise<PaymentMethod | null> {
  const all = await listPaymentMethods();
  return (
    all.find((m) => m.is_default && m.is_active) ??
    all.find((m) => m.is_active) ??
    null
  );
}

/**
 * Active payment methods to display to end customers on checkout / confirmation.
 * All server-rendered, so no auth boundary to worry about.
 */
export async function listActivePaymentMethodsForCustomer(): Promise<
  PaymentMethod[]
> {
  const all = await listPaymentMethods();
  return all
    .filter((m) => m.is_active)
    .sort((a, b) => {
      if (a.is_default && !b.is_default) return -1;
      if (!a.is_default && b.is_default) return 1;
      return a.sort_order - b.sort_order;
    });
}
