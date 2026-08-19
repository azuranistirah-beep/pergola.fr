// TEMPORARY diagnostic endpoint — reports MySQL connectivity + env visibility
// at runtime. Remove after the 0-products issue is resolved.
//
// Access at: https://pergolafr.com/api/debug-db?key=<TOKEN>
// Token is checked against DEBUG_DB_TOKEN env var; falls back to a hard string
// if unset (so we can still reach it after deploy before setting the env).
//
// Returns JSON:
//  { env: {...redacted}, connection: "ok" | error message, counts: {...} }

import { NextResponse } from "next/server";
import mysql from "mysql2/promise";
import bcrypt from "bcryptjs";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

const FALLBACK_TOKEN = "pergola-debug-9x2k";

function redact(v: string | undefined): string {
  if (!v) return "(unset)";
  if (v.length <= 4) return "***";
  return v.slice(0, 2) + "***" + v.slice(-2) + ` (len=${v.length})`;
}

export async function GET(req: Request) {
  const url = new URL(req.url);
  const key = url.searchParams.get("key");
  const expected = process.env.DEBUG_DB_TOKEN ?? FALLBACK_TOKEN;
  if (key !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const env = {
    MYSQL_HOST: process.env.MYSQL_HOST ?? "(unset)",
    MYSQL_PORT: process.env.MYSQL_PORT ?? "(unset)",
    MYSQL_USER: process.env.MYSQL_USER ?? "(unset)",
    MYSQL_PASSWORD: redact(process.env.MYSQL_PASSWORD),
    MYSQL_DATABASE: process.env.MYSQL_DATABASE ?? "(unset)",
    MYSQL_URL: redact(process.env.MYSQL_URL),
    NODE_ENV: process.env.NODE_ENV ?? "(unset)",
  };

  // Attempt a one-shot connection independent of the shared pool so we surface
  // the raw driver error without any wrapper swallowing it.
  const opts = process.env.MYSQL_URL
    ? { uri: process.env.MYSQL_URL }
    : {
        host: process.env.MYSQL_HOST,
        port: Number(process.env.MYSQL_PORT ?? "3306"),
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DATABASE,
      };

  let connection: string = "ok";
  let counts: Record<string, number | string> = {};
  let adminCheck: Record<string, unknown> = {};
  try {
    const conn = await mysql.createConnection(opts);
    try {
      const tables = ["products", "categories", "product_translations", "product_media", "admin_users"];
      for (const t of tables) {
        try {
          const [rows] = await conn.query<mysql.RowDataPacket[]>(
            `SELECT COUNT(*) AS n FROM \`${t}\``,
          );
          counts[t] = Number(rows[0]?.n ?? 0);
        } catch (e) {
          counts[t] = `ERR: ${e instanceof Error ? e.message : String(e)}`;
        }
      }
      try {
        const [rows] = await conn.query<mysql.RowDataPacket[]>(
          "SELECT COUNT(*) AS n FROM products WHERE status = 'PUBLISHED'",
        );
        counts["products (PUBLISHED)"] = Number(rows[0]?.n ?? 0);
      } catch (e) {
        counts["products (PUBLISHED)"] = `ERR: ${e instanceof Error ? e.message : String(e)}`;
      }

      // Admin login diagnostic — runs bcrypt.compare on the server so we know
      // whether the stored hash actually matches the expected password using
      // the SAME bcryptjs the login flow uses. Password is hard-coded here for
      // one-shot debugging; delete this route once fixed.
      try {
        const [rows] = await conn.query<mysql.RowDataPacket[]>(
          "SELECT email, password_hash, LENGTH(password_hash) AS hash_len, is_active, totp_enabled FROM admin_users WHERE email = ? LIMIT 1",
          ["admin@pergolafr.com"],
        );
        const row = rows[0];
        if (!row) {
          adminCheck = { error: "no row for admin@pergolafr.com" };
        } else {
          const testPassword = "PergolaFR2026!";
          const stored = String(row.password_hash);
          const ok = await bcrypt.compare(testPassword, stored);
          adminCheck = {
            email: row.email,
            is_active: row.is_active,
            totp_enabled: row.totp_enabled,
            hash_len: row.hash_len,
            hash_prefix: stored.slice(0, 10),
            hash_suffix: stored.slice(-10),
            test_password: testPassword,
            bcrypt_compare: ok,
          };
        }
      } catch (e) {
        adminCheck = { error: e instanceof Error ? e.message : String(e) };
      }
    } finally {
      await conn.end();
    }
  } catch (err) {
    connection = `ERROR: ${err instanceof Error ? `${err.name}: ${err.message}` : String(err)}`;
    if (err instanceof Error && "code" in err) {
      connection += ` [code=${(err as { code?: string }).code}]`;
    }
  }

  return NextResponse.json({ env, connection, counts, adminCheck, ts: new Date().toISOString() });
}
