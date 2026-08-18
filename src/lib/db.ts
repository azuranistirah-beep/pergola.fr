// MySQL connection pool + tiny query helpers.
//
// This replaces the old InsForge SDK client. The rest of the codebase talks
// SQL directly through these helpers — no ORM, no query builder. That keeps
// the mental model flat (a SQL string + params) and matches the migration
// artefacts in `migration/*.sql`.
//
// Deploy target is Hostinger Business MySQL (utf8mb4). One shared pool per
// process; in dev we cache it on `globalThis` so Next's HMR doesn't leak
// connections on every hot reload.

import "server-only";
import mysql, {
  type Pool,
  type PoolOptions,
  type ResultSetHeader,
  type RowDataPacket,
} from "mysql2/promise";
import { randomUUID } from "node:crypto";

// -----------------------------------------------------------------------------
// Pool
// -----------------------------------------------------------------------------

function buildPoolOptions(): PoolOptions {
  const url = process.env.MYSQL_URL;
  const shared: PoolOptions = {
    // Return TIMESTAMP columns as strings ("YYYY-MM-DD HH:mm:ss.SSSSSS") so
    // downstream `new Date(row.created_at)` behaves identically to the old
    // InsForge JSON responses. Otherwise `mysql2` hydrates them to Date
    // objects and the JSON serialisation shifts to the server timezone.
    dateStrings: true,
    connectionLimit: Number(process.env.MYSQL_POOL_SIZE ?? "10"),
    waitForConnections: true,
    // Return numeric strings for BIGINT to avoid the JS 53-bit precision cliff.
    // We don't currently have BIGINT PKs the app reads (only auto-inc log ids),
    // but this future-proofs it.
    supportBigNumbers: true,
    bigNumberStrings: true,
  };
  if (url) return { uri: url, ...shared };
  return {
    host: process.env.MYSQL_HOST,
    port: Number(process.env.MYSQL_PORT ?? "3306"),
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    ...shared,
  };
}

const globalForDb = globalThis as unknown as { __mysqlPool?: Pool };

export const pool: Pool =
  globalForDb.__mysqlPool ?? mysql.createPool(buildPoolOptions());

if (process.env.NODE_ENV !== "production") globalForDb.__mysqlPool = pool;

// -----------------------------------------------------------------------------
// Query helpers
// -----------------------------------------------------------------------------

/**
 * Run a SELECT and return all rows typed as T.
 * Uses `?` positional placeholders. Arrays for `IN` clauses expand
 * automatically thanks to mysql2's `format()`.
 */
export async function query<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T[]> {
  const [rows] = await pool.query<RowDataPacket[]>(sql, params);
  return rows as T[];
}

/** Convenience — return the first row or null. */
export async function queryOne<T = Record<string, unknown>>(
  sql: string,
  params: unknown[] = [],
): Promise<T | null> {
  const rows = await query<T>(sql, params);
  return rows[0] ?? null;
}

/**
 * Run INSERT/UPDATE/DELETE and return the raw header (affectedRows, insertId).
 * We use `pool.query` (not `pool.execute`) because query() lets us bind an
 * array to `IN (?)` — execute() rejects it as a non-`ExecuteValues` type. The
 * runtime behaviour we care about (SQL injection safety) is identical: both
 * escape parameters through mysql2's format() before sending to the server.
 */
export async function execute(
  sql: string,
  params: unknown[] = [],
): Promise<ResultSetHeader> {
  const [header] = await pool.query<ResultSetHeader>(sql, params);
  return header;
}

// -----------------------------------------------------------------------------
// Row-shape helpers — the app used gen_random_uuid() defaults in Postgres;
// on MySQL we mint ids client-side.
// -----------------------------------------------------------------------------

export const newId = () => randomUUID();

/**
 * Format a Date (or ISO string) into MySQL's expected literal form —
 * `YYYY-MM-DD HH:mm:ss.SSS` in UTC. mysql2 does this internally when you
 * pass a Date, but a lot of the codebase carries ISO strings around (from the
 * old InsForge JSON), and `2026-07-21T08:42:53.414Z` doesn't parse cleanly
 * into a TIMESTAMP column on every server SQL_MODE.
 */
export function toSqlDate(input: Date | string = new Date()): string {
  const d = typeof input === "string" ? new Date(input) : input;
  const pad = (n: number, len = 2) => String(n).padStart(len, "0");
  return (
    `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())} ` +
    `${pad(d.getUTCHours())}:${pad(d.getUTCMinutes())}:${pad(d.getUTCSeconds())}.` +
    pad(d.getUTCMilliseconds(), 3)
  );
}

// -----------------------------------------------------------------------------
// INSERT / UPDATE builders — mysql2 lets you bind an object to `SET ?`, but
// hand-writing the column list is safer (drops undefined values so we don't
// clobber a NOT NULL column with `undefined`).
// -----------------------------------------------------------------------------

type SqlValue = string | number | boolean | Date | null | Buffer;

function cleanRow(row: Record<string, unknown>): Record<string, SqlValue> {
  const out: Record<string, SqlValue> = {};
  for (const [k, v] of Object.entries(row)) {
    if (v === undefined) continue;
    // Coerce Dates to MySQL-friendly strings so SQL_MODE=STRICT never rejects
    // the ISO 8601 form.
    out[k] = v instanceof Date ? toSqlDate(v) : (v as SqlValue);
  }
  return out;
}

/**
 * INSERT one row and return the ResultSetHeader (holds insertId + affectedRows).
 * The row keys are quoted as column names — no interpolation of untrusted
 * data into the SQL.
 */
export async function insertOne(
  table: string,
  row: Record<string, unknown>,
): Promise<ResultSetHeader> {
  const clean = cleanRow(row);
  const cols = Object.keys(clean);
  if (!cols.length) throw new Error(`insertOne(${table}): empty row`);
  const colList = cols.map((c) => `\`${c}\``).join(", ");
  const placeholders = cols.map(() => "?").join(", ");
  const sql = `INSERT INTO \`${table}\` (${colList}) VALUES (${placeholders})`;
  return execute(
    sql,
    cols.map((c) => clean[c]),
  );
}

/**
 * INSERT many rows in one round-trip. All rows must have the same keys.
 * Returns the ResultSetHeader (affectedRows = rows.length).
 */
export async function insertMany(
  table: string,
  rows: Record<string, unknown>[],
): Promise<ResultSetHeader> {
  if (!rows.length) return { affectedRows: 0 } as ResultSetHeader;
  const cleaned = rows.map(cleanRow);
  const first = cleaned[0];
  if (!first) throw new Error(`insertMany(${table}): empty rows`);
  const cols = Object.keys(first);
  if (!cols.length) throw new Error(`insertMany(${table}): empty rows`);
  const colList = cols.map((c) => `\`${c}\``).join(", ");
  const placeholders = `(${cols.map(() => "?").join(", ")})`;
  const sql =
    `INSERT INTO \`${table}\` (${colList}) VALUES ` +
    cleaned.map(() => placeholders).join(", ");
  // Some rows may miss a key present in `first` after cleanRow() dropped
  // undefined values — normalise missing columns to NULL so the placeholder
  // count still lines up with the parameter list.
  const params: SqlValue[] = [];
  for (const r of cleaned) for (const c of cols) params.push(r[c] ?? null);
  return execute(sql, params);
}

/**
 * UPDATE with a fixed WHERE clause. Returns affectedRows.
 * Example:
 *   updateWhere("orders", { status: "SHIPPED" }, "id = ?", [orderId])
 */
export async function updateWhere(
  table: string,
  patch: Record<string, unknown>,
  where: string,
  whereParams: unknown[] = [],
): Promise<ResultSetHeader> {
  const clean = cleanRow(patch);
  const cols = Object.keys(clean);
  if (!cols.length) throw new Error(`updateWhere(${table}): empty patch`);
  const setList = cols.map((c) => `\`${c}\` = ?`).join(", ");
  const sql = `UPDATE \`${table}\` SET ${setList} WHERE ${where}`;
  return execute(sql, [...cols.map((c) => clean[c]), ...whereParams]);
}

/**
 * UPSERT one row — INSERT … ON DUPLICATE KEY UPDATE. Only the columns present
 * in the row are updated on conflict, matching the ergonomics of the old
 * InsForge `upsert([…])`.
 */
export async function upsertOne(
  table: string,
  row: Record<string, unknown>,
): Promise<ResultSetHeader> {
  const clean = cleanRow(row);
  const cols = Object.keys(clean);
  if (!cols.length) throw new Error(`upsertOne(${table}): empty row`);
  const colList = cols.map((c) => `\`${c}\``).join(", ");
  const placeholders = cols.map(() => "?").join(", ");
  // `col = VALUES(col)` is deprecated in MySQL 8; the current form uses an
  // alias on the VALUES row. Both still work, but the alias form is future-proof.
  const updateList = cols.map((c) => `\`${c}\` = new_row.\`${c}\``).join(", ");
  const sql =
    `INSERT INTO \`${table}\` (${colList}) VALUES (${placeholders}) AS new_row ` +
    `ON DUPLICATE KEY UPDATE ${updateList}`;
  return execute(
    sql,
    cols.map((c) => clean[c]),
  );
}
