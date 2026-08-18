import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI, verifySync } from "otplib";
import {
  execute,
  insertOne,
  query,
  queryOne,
  toSqlDate,
  updateWhere,
} from "@/lib/db";

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

// The DB returns TINYINT(1) as 0/1; hydrate to booleans at the boundary.
interface AdminUserRow {
  id: string;
  email: string;
  name: string;
  is_active: number;
  totp_enabled: number;
}

function toUser(row: AdminUserRow): AdminUser {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    is_active: row.is_active === 1,
    totp_enabled: row.totp_enabled === 1,
  };
}

async function clientIp(): Promise<string> {
  const h = await headers();
  const xff = h.get("x-forwarded-for");
  if (xff) return xff.split(",")[0]!.trim();
  return h.get("x-real-ip") ?? "unknown";
}

async function recentFailures(ip: string): Promise<number> {
  const since = toSqlDate(new Date(Date.now() - RL_WINDOW_MINUTES * 60 * 1000));
  const rows = await query<{ n: number }>(
    "SELECT COUNT(*) AS n FROM admin_login_attempts " +
      "WHERE ip = ? AND success = 0 AND attempted_at >= ?",
    [ip, since],
  );
  return Number(rows[0]?.n ?? 0);
}

async function logAttempt(
  ip: string,
  success: boolean,
  email: string,
  userId: string | null,
) {
  await insertOne("admin_login_attempts", {
    ip,
    success: success ? 1 : 0,
    email,
    user_id: userId,
  });
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
  const row = await queryOne<AdminUserRow>(
    "SELECT id, email, name, is_active, totp_enabled FROM admin_users WHERE id = ? LIMIT 1",
    [userId],
  );
  if (!row || row.is_active !== 1) return null;
  return toUser(row);
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

  const row = await queryOne<{
    id: string;
    email: string;
    password_hash: string;
    is_active: number;
    totp_enabled: number;
  }>(
    "SELECT id, email, password_hash, is_active, totp_enabled FROM admin_users WHERE email = ? LIMIT 1",
    [cleanEmail],
  );

  if (!row || row.is_active !== 1) {
    // Constant-time miss — burn a bcrypt compare on a dummy hash so timing
    // doesn't leak whether the email existed.
    await bcrypt.compare(
      password,
      "$2b$12$dummydummydummydummydummydummydummydummydummydummydu",
    );
    await logAttempt(ip, false, cleanEmail, null);
    return "invalid";
  }

  const ok = await bcrypt.compare(password, row.password_hash);
  if (!ok) {
    await logAttempt(ip, false, cleanEmail, row.id);
    return "invalid";
  }

  if (row.totp_enabled === 1) {
    // Issue short-lived pending cookie; do NOT log as success yet.
    await setSessionCookie(
      PENDING_COOKIE,
      issueTokenWithTtl(row.id, "pending"),
      PENDING_TTL_SECONDS,
    );
    return "needs_totp";
  }

  await logAttempt(ip, true, cleanEmail, row.id);
  await updateWhere(
    "admin_users",
    { last_login_at: toSqlDate() },
    "id = ?",
    [row.id],
  );
  await setSessionCookie(
    COOKIE_NAME,
    issueTokenWithTtl(row.id, "full"),
    SESSION_TTL_SECONDS,
  );
  return "ok";
}

export async function verifyTotpAndCompleteLogin(code: string): Promise<boolean> {
  const pending = await getPendingUser();
  if (!pending) return false;
  const row = await queryOne<{ totp_secret: string | null }>(
    "SELECT totp_secret FROM admin_users WHERE id = ? LIMIT 1",
    [pending.id],
  );
  const s = row?.totp_secret;
  if (!s) return false;
  const clean = code.replace(/\s+/g, "");
  const ok = totpVerify(clean, s);

  const ip = await clientIp();
  await logAttempt(ip, ok, pending.email, pending.id);
  if (!ok) return false;

  await updateWhere(
    "admin_users",
    { last_login_at: toSqlDate() },
    "id = ?",
    [pending.id],
  );

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
  await updateWhere(
    "admin_users",
    { totp_secret: totpSecret, totp_enabled: 1 },
    "id = ?",
    [userId],
  );
  return true;
}

export async function disableTotpForUser(userId: string) {
  await updateWhere(
    "admin_users",
    { totp_secret: null, totp_enabled: 0 },
    "id = ?",
    [userId],
  );
}

// `execute` is imported to keep future TODO callers on the same helper set —
// don't remove even if unused today.
void execute;
