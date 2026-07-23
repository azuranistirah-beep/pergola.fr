import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import { insforgeAdmin } from "@/lib/insforge-admin";

const COOKIE_NAME = "pergola_admin";
const PENDING_COOKIE = "pergola_admin_pending";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const PENDING_TTL_SECONDS = 5 * 60; // 5 minutes for 2FA challenge
const RL_WINDOW_MINUTES = 15;
const RL_MAX_FAILURES = 5;
const BCRYPT_COST = 12;

const secret = process.env.ADMIN_SESSION_SECRET;

// Allow ±30s of clock drift.
const TOTP_TOLERANCE_SECONDS = 30;

function totpVerify(token: string, secret: string): boolean {
  try {
    const r = verifySync({ token, secret, epochTolerance: TOTP_TOLERANCE_SECONDS });
    return r?.valid === true;
  } catch {
    return false;
  }
}

export interface AdminUser {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  totp_enabled: boolean;
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

async function recentFailures(ip: string): Promise<number> {
  const since = new Date(Date.now() - RL_WINDOW_MINUTES * 60 * 1000).toISOString();
  const { data } = await insforgeAdmin.database
    .from("admin_login_attempts")
    .select("id")
    .eq("ip", ip)
    .eq("success", false)
    .gte("attempted_at", since);
  return (data ?? []).length;
}

async function logAttempt(
  ip: string,
  success: boolean,
  email: string,
  userId: string | null,
) {
  await insforgeAdmin.database
    .from("admin_login_attempts")
    .insert({ ip, success, email, user_id: userId });
}

function requireSecret(): string {
  if (!secret) {
    throw new Error(
      "ADMIN_SESSION_SECRET is not set. Add a random 32+ byte hex to .env.local.",
    );
  }
  return secret;
}

function sign(payload: string): string {
  return createHmac("sha256", requireSecret()).update(payload).digest("hex");
}

function issueTokenWithTtl(userId: string, kind: "full" | "pending"): string {
  const sessionId = randomBytes(24).toString("hex");
  const issuedAt = Math.floor(Date.now() / 1000).toString();
  const payload = `${kind}.${userId}.${sessionId}.${issuedAt}`;
  return `${payload}.${sign(payload)}`;
}

function verifyToken(
  token: string | undefined,
  expectedKind: "full" | "pending",
): { userId: string } | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 5) return null;
  const [kind, userId, sessionId, issuedAt, sig] = parts;
  if (!kind || !userId || !sessionId || !issuedAt || !sig) return null;
  if (kind !== expectedKind) return null;
  const issuedAtNum = Number(issuedAt);
  if (!Number.isFinite(issuedAtNum)) return null;
  const ttl =
    expectedKind === "full" ? SESSION_TTL_SECONDS : PENDING_TTL_SECONDS;
  const ageSeconds = Math.floor(Date.now() / 1000) - issuedAtNum;
  if (ageSeconds < 0 || ageSeconds > ttl) return null;
  const expected = sign(`${kind}.${userId}.${sessionId}.${issuedAt}`);
  const a = Buffer.from(sig, "hex");
  const b = Buffer.from(expected, "hex");
  if (a.length !== b.length) return null;
  if (!timingSafeEqual(a, b)) return null;
  return { userId };
}

async function loadUser(userId: string): Promise<AdminUser | null> {
  const { data } = await insforgeAdmin.database
    .from("admin_users")
    .select("id, email, name, is_active, totp_enabled")
    .eq("id", userId)
    .limit(1);
  const u = (data ?? [])[0] as AdminUser | undefined;
  if (!u || !u.is_active) return null;
  return u;
}

export async function getAdminUser(): Promise<AdminUser | null> {
  if (!secret) return null;
  const store = await cookies();
  const parsed = verifyToken(store.get(COOKIE_NAME)?.value, "full");
  if (!parsed) return null;
  return loadUser(parsed.userId);
}

export async function isAdmin(): Promise<boolean> {
  return (await getAdminUser()) !== null;
}

export async function requireAdmin(): Promise<AdminUser> {
  const u = await getAdminUser();
  if (!u) redirect("/admin/login");
  return u;
}

export async function getPendingUser(): Promise<AdminUser | null> {
  if (!secret) return null;
  const store = await cookies();
  const parsed = verifyToken(store.get(PENDING_COOKIE)?.value, "pending");
  if (!parsed) return null;
  return loadUser(parsed.userId);
}

export class LoginBlockedError extends Error {
  constructor(public retryAfterSeconds: number) {
    super("Too many failed attempts. Try again later.");
    this.name = "LoginBlockedError";
  }
}

export type LoginResult = "ok" | "invalid" | "needs_totp";

async function setSessionCookie(name: string, value: string, maxAge: number) {
  const store = await cookies();
  store.set(name, value, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge,
  });
}

export async function loginAdmin(
  email: string,
  password: string,
): Promise<LoginResult> {
  if (!secret) return "invalid";
  const cleanEmail = email.trim().toLowerCase();

  const ip = await clientIp();
  if ((await recentFailures(ip)) >= RL_MAX_FAILURES) {
    throw new LoginBlockedError(RL_WINDOW_MINUTES * 60);
  }

  const { data } = await insforgeAdmin.database
    .from("admin_users")
    .select("id, email, password_hash, is_active, totp_enabled")
    .eq("email", cleanEmail)
    .limit(1);
  const user = (data ?? [])[0] as
    | {
        id: string;
        email: string;
        password_hash: string;
        is_active: boolean;
        totp_enabled: boolean;
      }
    | undefined;

  if (!user || !user.is_active) {
    await bcrypt.compare(
      password,
      "$2b$12$dummydummydummydummydummydummydummydummydummydummydu",
    );
    await logAttempt(ip, false, cleanEmail, null);
    return "invalid";
  }

  const ok = await bcrypt.compare(password, user.password_hash);
  if (!ok) {
    await logAttempt(ip, false, cleanEmail, user.id);
    return "invalid";
  }

  if (user.totp_enabled) {
    // Issue short-lived pending cookie; do NOT log as success yet.
    await setSessionCookie(
      PENDING_COOKIE,
      issueTokenWithTtl(user.id, "pending"),
      PENDING_TTL_SECONDS,
    );
    return "needs_totp";
  }

  await logAttempt(ip, true, cleanEmail, user.id);
  await insforgeAdmin.database
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", user.id);
  await setSessionCookie(
    COOKIE_NAME,
    issueTokenWithTtl(user.id, "full"),
    SESSION_TTL_SECONDS,
  );
  return "ok";
}

export async function verifyTotpAndCompleteLogin(code: string): Promise<boolean> {
  const pending = await getPendingUser();
  if (!pending) return false;
  const { data } = await insforgeAdmin.database
    .from("admin_users")
    .select("totp_secret")
    .eq("id", pending.id)
    .limit(1);
  const s = ((data ?? [])[0] as { totp_secret: string | null } | undefined)
    ?.totp_secret;
  if (!s) return false;
  const clean = code.replace(/\s+/g, "");
  const ok = totpVerify(clean, s);

  const ip = await clientIp();
  await logAttempt(ip, ok, pending.email, pending.id);
  if (!ok) return false;

  await insforgeAdmin.database
    .from("admin_users")
    .update({ last_login_at: new Date().toISOString() })
    .eq("id", pending.id);

  const store = await cookies();
  store.delete(PENDING_COOKIE);
  await setSessionCookie(
    COOKIE_NAME,
    issueTokenWithTtl(pending.id, "full"),
    SESSION_TTL_SECONDS,
  );
  return true;
}

export async function logoutAdmin() {
  const store = await cookies();
  store.delete(COOKIE_NAME);
  store.delete(PENDING_COOKIE);
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, BCRYPT_COST);
}

// ─── 2FA enrollment helpers ────────────────────────────────────────────

export async function generateTotpSecret(user: AdminUser, appName = "Pergola FR") {
  const s = generateSecret();
  const otpauth = generateURI({ label: user.email, issuer: appName, secret: s });
  return { secret: s, otpauth };
}

export async function enableTotpForUser(
  userId: string,
  totpSecret: string,
  code: string,
): Promise<boolean> {
  const clean = code.replace(/\s+/g, "");
  if (!totpVerify(clean, totpSecret)) return false;
  await insforgeAdmin.database
    .from("admin_users")
    .update({ totp_secret: totpSecret, totp_enabled: true })
    .eq("id", userId);
  return true;
}

export async function disableTotpForUser(userId: string) {
  await insforgeAdmin.database
    .from("admin_users")
    .update({ totp_secret: null, totp_enabled: false })
    .eq("id", userId);
}
