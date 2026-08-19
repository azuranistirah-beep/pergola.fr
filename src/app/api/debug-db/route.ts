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
      // Published-only count for products (matches listProducts filter)
      try {
        const [rows] = await conn.query<mysql.RowDataPacket[]>(
          "SELECT COUNT(*) AS n FROM products WHERE status = 'PUBLISHED'",
        );
        counts["products (PUBLISHED)"] = Number(rows[0]?.n ?? 0);
      } catch (e) {
        counts["products (PUBLISHED)"] = `ERR: ${e instanceof Error ? e.message : String(e)}`;
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

  return NextResponse.json({ env, connection, counts, ts: new Date().toISOString() });
}
