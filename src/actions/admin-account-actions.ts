"use server";

import { revalidatePath } from "next/cache";
import QRCode from "qrcode";
import {
  disableTotpForUser,
  enableTotpForUser,
  generateTotpSecret,
  requireAdmin,
} from "@/lib/admin-auth";

/** Step 1 of enrollment: create a secret + QR code for the current user. */
export async function startTotpEnrollment(): Promise<{
  secret: string;
  otpauth: string;
  qrDataUrl: string;
}> {
  const user = await requireAdmin();
  const { secret, otpauth } = await generateTotpSecret(user);
  const qrDataUrl = await QRCode.toDataURL(otpauth, { margin: 1, width: 240 });
  return { secret, otpauth, qrDataUrl };
}

/** Step 2 of enrollment: verify code and save secret. */
export async function confirmTotpEnrollment(
  secret: string,
  code: string,
): Promise<boolean> {
  const user = await requireAdmin();
  const ok = await enableTotpForUser(user.id, secret, code);
  if (ok) revalidatePath("/admin/account");
  return ok;
}

export async function disableTotp() {
  const user = await requireAdmin();
  await disableTotpForUser(user.id);
  revalidatePath("/admin/account");
}
