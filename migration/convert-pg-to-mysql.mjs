// Convert an InsForge (Postgres) pg_dump into MySQL 8-compatible SQL.
//
// Input:  a full pg_dump file passed as the first CLI argument.
// Output: three files next to the dump, side-by-side:
//   - mysql-schema.sql   → CREATE TABLE + indexes for public.* only
//   - mysql-data.sql     → INSERT INTO … generated from COPY DATA blocks
//   - mysql-fk.sql       → FOREIGN KEY constraints (applied last, after data)
//
// Notes:
//   * We ignore every schema other than `public` — auth/storage/payments/etc.
//     tables come from InsForge itself and would just fail on MySQL.
//   * Enum types (CREATE TYPE public.foo AS ENUM (…)) are inlined into
//     column definitions as MySQL native ENUM(...).
//   * Postgres `text` becomes MySQL `TEXT`; keys/indexes on TEXT need a prefix
//     length in MySQL, so we replace `text` columns that are UNIQUE or in an
//     index with `VARCHAR(191)`. 191 keeps utf8mb4 * 4 bytes under the 767b
//     row-format limit even on legacy InnoDB.
//   * pg_dump COPY format uses tab-separated values with backslash escapes.
//     We rebuild the rows as standard multi-row INSERTs.

import { readFileSync, writeFileSync } from "node:fs";
import { basename, dirname, join } from "node:path";

const dumpPath = process.argv[2];
if (!dumpPath) {
  console.error("Usage: node convert-pg-to-mysql.mjs <path-to-pg-dump.sql>");
  process.exit(1);
}

const raw = readFileSync(dumpPath, "utf8");
const lines = raw.split("\n");
const outDir = dirname(dumpPath).endsWith("migration")
  ? dirname(dumpPath)
  : "/Volumes/Okka/pergolafr.com/migration";

// -----------------------------------------------------------------------------
// Step 1 — collect enum types (public.*) so we can inline them later
// -----------------------------------------------------------------------------
/** @type {Record<string, string[]>} */
const enums = {};
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^CREATE TYPE public\.(\w+) AS ENUM \(/);
  if (!m) continue;
  const name = m[1];
  const values = [];
  for (let j = i + 1; j < lines.length; j++) {
    const line = lines[j].trim();
    if (line.startsWith(");")) break;
    const v = line.match(/'([^']*)'/);
    if (v) values.push(v[1]);
  }
  enums[name] = values;
}
console.log(`→ enums: ${Object.keys(enums).join(", ")}`);

// -----------------------------------------------------------------------------
// Step 2 — collect CREATE TABLE blocks for public.*
// -----------------------------------------------------------------------------
/** @type {Record<string, string[]>} raw column definition lines, cleaned */
const tables = {};
/** @type {string[]} table names, in creation order */
const tableOrder = [];
for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^CREATE TABLE public\.(\w+) \(/);
  if (!m) continue;
  const tbl = m[1];
  const cols = [];
  for (let j = i + 1; j < lines.length; j++) {
    const line = lines[j];
    if (line.startsWith(");")) break;
    cols.push(line);
  }
  tables[tbl] = cols;
  tableOrder.push(tbl);
}
console.log(`→ tables: ${tableOrder.length} (${tableOrder.join(", ")})`);

// Sequence-owned columns → mark for AUTO_INCREMENT.
/** @type {Set<string>} keys as `${table}.${col}` */
const autoIncCols = new Set();
for (const line of lines) {
  const m = line.match(
    /^ALTER TABLE ONLY public\.(\w+) ALTER COLUMN (\w+) SET DEFAULT nextval/,
  );
  if (m) autoIncCols.add(`${m[1]}.${m[2]}`);
}

// -----------------------------------------------------------------------------
// Step 3 — collect PK / UNIQUE constraints (needed to size TEXT columns)
// -----------------------------------------------------------------------------
/** @type {Record<string, {pk?: string[]; uniques: string[][]}>} */
const constraints = {};
for (const tbl of tableOrder) constraints[tbl] = { uniques: [] };

for (let i = 0; i < lines.length; i++) {
  const alter = lines[i].match(/^ALTER TABLE ONLY public\.(\w+)$/);
  if (!alter) continue;
  const tbl = alter[1];
  const body = lines[i + 1] ?? "";
  const pk = body.match(/ADD CONSTRAINT \S+ PRIMARY KEY \(([^)]+)\)/);
  if (pk) {
    constraints[tbl].pk = pk[1].split(",").map((s) => s.trim());
    continue;
  }
  const uq = body.match(/ADD CONSTRAINT \S+ UNIQUE \(([^)]+)\)/);
  if (uq) {
    constraints[tbl].uniques.push(uq[1].split(",").map((s) => s.trim()));
  }
}

// -----------------------------------------------------------------------------
// Step 4 — collect FK constraints (emitted last)
// -----------------------------------------------------------------------------
/** @type {Array<{table: string; column: string; refTable: string; refColumn: string; onDelete?: string}>} */
const foreignKeys = [];
for (let i = 0; i < lines.length; i++) {
  const alter = lines[i].match(/^ALTER TABLE ONLY public\.(\w+)$/);
  if (!alter) continue;
  const body = lines[i + 1] ?? "";
  const fk = body.match(
    /ADD CONSTRAINT \S+ FOREIGN KEY \((\w+)\) REFERENCES public\.(\w+)\((\w+)\)(?:\s+ON DELETE (\w+(?:\s\w+)?))?/,
  );
  if (fk) {
    foreignKeys.push({
      table: alter[1],
      column: fk[1],
      refTable: fk[2],
      refColumn: fk[3],
      onDelete: fk[4],
    });
  }
}

// -----------------------------------------------------------------------------
// Step 5 — collect CREATE INDEX for public.*
// -----------------------------------------------------------------------------
/** @type {Array<{name: string; table: string; unique: boolean; expr: string}>} */
const indexes = [];
for (const line of lines) {
  const m = line.match(
    /^CREATE (UNIQUE )?INDEX (\w+) ON public\.(\w+) USING \w+ \(([^)]+)\)(.*);?$/,
  );
  if (!m) continue;
  indexes.push({
    name: m[2],
    table: m[3],
    unique: Boolean(m[1]),
    expr: m[4],
  });
}

// -----------------------------------------------------------------------------
// Helpers — figure out which text columns need to be VARCHAR(191) for indexing
// -----------------------------------------------------------------------------
function indexedColumns(table) {
  const set = new Set();
  const c = constraints[table];
  c.pk?.forEach((col) => set.add(col));
  c.uniques.forEach((u) => u.forEach((col) => set.add(col)));
  indexes.filter((i) => i.table === table).forEach((i) => {
    // Take the first column of the expression, strip DESC/ASC etc.
    i.expr.split(",").forEach((part) => {
      const name = part.trim().split(/\s+/)[0].replace(/["`]/g, "");
      set.add(name);
    });
  });
  // FK source columns must match the referenced column's type — MySQL rejects
  // a TEXT→VARCHAR foreign key with errno 150. Force-promote any column named
  // as the local side of a public.* → public.* FK.
  foreignKeys
    .filter((fk) => fk.table === table)
    .forEach((fk) => set.add(fk.column));
  return set;
}

// -----------------------------------------------------------------------------
// Step 6 — convert one column definition line to MySQL
// -----------------------------------------------------------------------------
function convertColumn(rawLine, table) {
  // rawLine looks like:  "    slug character varying(160) NOT NULL," or
  //                     "    status public.contact_status DEFAULT 'NEW'::public.contact_status NOT NULL,"
  //                     "    features_json jsonb"
  //                     "    CONSTRAINT public_submissions_kind_check CHECK ((kind = ANY (ARRAY['contact'::text, 'newsletter'::text])))"
  let line = rawLine.trim().replace(/,$/, "");

  // CHECK constraint — convert Postgres ANY(ARRAY[...]) → IN (...) and drop ::text casts.
  if (line.startsWith("CONSTRAINT ")) {
    const m = line.match(
      /^CONSTRAINT (\w+) CHECK \(\((\w+) = ANY \(ARRAY\[(.+?)\]\)\)\)$/,
    );
    if (m) {
      const values = m[3].split(",").map((v) =>
        v.trim().replace(/::text$/, "").replace(/::[\w.]+$/, ""),
      );
      return `  CONSTRAINT ${m[1]} CHECK (${m[2]} IN (${values.join(", ")}))`;
    }
    // Fallback: keep raw, MySQL may or may not accept it.
    return `  ${line}`;
  }

  // Split "name TYPE …tail"
  const nameMatch = line.match(/^(\w+)\s+(.*)$/);
  if (!nameMatch) return `  ${line}`;
  const name = nameMatch[1];
  let rest = nameMatch[2];

  const idxSet = indexedColumns(table);
  const inIndex = idxSet.has(name);

  // ---------- type mapping ----------
  let type;
  if (/^bigint\b/i.test(rest)) {
    type = "BIGINT";
    rest = rest.replace(/^bigint/i, "").trim();
  } else if (/^integer\b/i.test(rest)) {
    type = "INT";
    rest = rest.replace(/^integer/i, "").trim();
  } else if (/^smallint\b/i.test(rest)) {
    type = "SMALLINT";
    rest = rest.replace(/^smallint/i, "").trim();
  } else if (/^boolean\b/i.test(rest)) {
    type = "TINYINT(1)";
    rest = rest.replace(/^boolean/i, "").trim();
  } else if (/^numeric\((\d+),(\d+)\)/i.test(rest)) {
    const m = rest.match(/^numeric\((\d+),(\d+)\)/i);
    type = `DECIMAL(${m[1]},${m[2]})`;
    rest = rest.replace(/^numeric\(\d+,\d+\)/i, "").trim();
  } else if (/^numeric\b/i.test(rest)) {
    type = "DECIMAL(20,6)";
    rest = rest.replace(/^numeric/i, "").trim();
  } else if (/^jsonb\b/i.test(rest) || /^json\b/i.test(rest)) {
    type = "JSON";
    rest = rest.replace(/^jsonb?\b/i, "").trim();
  } else if (/^uuid\b/i.test(rest)) {
    type = "CHAR(36)";
    rest = rest.replace(/^uuid/i, "").trim();
  } else if (/^character varying\((\d+)\)/i.test(rest)) {
    const m = rest.match(/^character varying\((\d+)\)/i);
    type = `VARCHAR(${m[1]})`;
    rest = rest.replace(/^character varying\(\d+\)/i, "").trim();
  } else if (/^character varying\b/i.test(rest)) {
    type = "VARCHAR(255)";
    rest = rest.replace(/^character varying/i, "").trim();
  } else if (/^text\[\]/i.test(rest)) {
    type = "JSON";
    rest = rest.replace(/^text\[\]/i, "").trim();
  } else if (/^text\b/i.test(rest)) {
    // TEXT can't be part of a MySQL index without a prefix. If this column is
    // used in a PK/UNIQUE/index, promote it to VARCHAR(191) — matches Rails'
    // convention and stays under the 767-byte legacy row-format limit.
    type = inIndex ? "VARCHAR(191)" : "TEXT";
    rest = rest.replace(/^text/i, "").trim();
  } else if (/^timestamp with time zone\b/i.test(rest)) {
    type = "TIMESTAMP(6)";
    rest = rest.replace(/^timestamp with time zone/i, "").trim();
  } else if (/^timestamp without time zone\b/i.test(rest)) {
    type = "DATETIME(6)";
    rest = rest.replace(/^timestamp without time zone/i, "").trim();
  } else if (/^timestamp\b/i.test(rest)) {
    type = "TIMESTAMP(6)";
    rest = rest.replace(/^timestamp/i, "").trim();
  } else if (/^public\.(\w+)\b/i.test(rest)) {
    // Enum reference — inline as MySQL ENUM
    const m = rest.match(/^public\.(\w+)/);
    const values = enums[m[1]];
    if (!values) throw new Error(`Unknown enum: ${m[1]} for ${table}.${name}`);
    type = `ENUM(${values.map((v) => `'${v}'`).join(", ")})`;
    rest = rest.replace(/^public\.\w+/, "").trim();
  } else {
    // Fallback — pass through the raw type but strip any Postgres-only cast.
    const parts = rest.split(/\s+/);
    type = parts.shift();
    rest = parts.join(" ");
  }

  // Strip Postgres-specific casts. pg_dump emits things like `'fr'::character
  // varying` or `'DRAFT'::public.product_status`, and the earlier regex
  // `::[\w ]+` accidentally swallowed trailing `NOT NULL` because spaces are
  // matched too. Restrict to the actual known type-name shapes.
  rest = rest.replace(/::(?:public\.)?\w+(?:\s+varying)?/g, "");
  // Drop `gen_random_uuid()` defaults — we'll generate ids in app code.
  rest = rest.replace(/DEFAULT \(gen_random_uuid\(\)\)/i, "");
  rest = rest.replace(/DEFAULT gen_random_uuid\(\)/i, "");
  // now() → CURRENT_TIMESTAMP(6)
  rest = rest.replace(/DEFAULT now\(\)/gi, "DEFAULT CURRENT_TIMESTAMP(6)");
  // AUTO_INCREMENT for sequence-owned columns
  const isAutoInc = autoIncCols.has(`${table}.${name}`);
  if (isAutoInc) rest += " AUTO_INCREMENT";
  // Squash whitespace
  rest = rest.replace(/\s+/g, " ").trim();

  return `  \`${name}\` ${type}${rest ? " " + rest : ""}`;
}

// -----------------------------------------------------------------------------
// Step 7 — emit CREATE TABLE + indexes
// -----------------------------------------------------------------------------
const schemaOut = [];
schemaOut.push("-- Generated by migration/convert-pg-to-mysql.mjs — do not edit by hand.");
schemaOut.push("-- Target: MySQL 8+ (utf8mb4).");
schemaOut.push("SET NAMES utf8mb4;");
schemaOut.push("SET FOREIGN_KEY_CHECKS = 0;");
schemaOut.push("");

for (const tbl of tableOrder) {
  const cols = tables[tbl].map((c) => convertColumn(c, tbl)).filter(Boolean);
  const c = constraints[tbl];
  if (c.pk) cols.push(`  PRIMARY KEY (${c.pk.map((k) => `\`${k}\``).join(", ")})`);
  c.uniques.forEach((u) => {
    cols.push(`  UNIQUE KEY (${u.map((k) => `\`${k}\``).join(", ")})`);
  });
  schemaOut.push(`DROP TABLE IF EXISTS \`${tbl}\`;`);
  schemaOut.push(
    `CREATE TABLE \`${tbl}\` (\n${cols.join(",\n")}\n) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;`,
  );
  schemaOut.push("");
}

// Regular (non-unique) indexes
for (const idx of indexes) {
  // The dump also emits a UNIQUE INDEX for orders.invoice_number with a
  // partial WHERE. MySQL 8 UNIQUE indexes allow multiple NULLs, so dropping
  // the WHERE preserves the intent (unique among non-NULL values only).
  const kind = idx.unique ? "UNIQUE INDEX" : "INDEX";
  // Strip `DESC`, `USING …`, expression casts, trailing partial WHERE.
  const expr = idx.expr
    .split(",")
    .map((p) => {
      const name = p.trim().split(/\s+/)[0].replace(/["`]/g, "");
      return `\`${name}\``;
    })
    .join(", ");
  schemaOut.push(
    `CREATE ${kind} \`${idx.name}\` ON \`${idx.table}\` (${expr});`,
  );
}
schemaOut.push("");
schemaOut.push("SET FOREIGN_KEY_CHECKS = 1;");

writeFileSync(join(outDir, "mysql-schema.sql"), schemaOut.join("\n"));
console.log(`✓ wrote mysql-schema.sql`);

// -----------------------------------------------------------------------------
// Step 8 — emit FK constraints separately (apply AFTER data import)
// -----------------------------------------------------------------------------
const fkOut = [];
fkOut.push("-- Foreign keys — apply after mysql-data.sql");
for (const fk of foreignKeys) {
  const onDelete = fk.onDelete ? ` ON DELETE ${fk.onDelete}` : "";
  fkOut.push(
    `ALTER TABLE \`${fk.table}\` ADD CONSTRAINT \`fk_${fk.table}_${fk.column}\` FOREIGN KEY (\`${fk.column}\`) REFERENCES \`${fk.refTable}\`(\`${fk.refColumn}\`)${onDelete};`,
  );
}
writeFileSync(join(outDir, "mysql-fk.sql"), fkOut.join("\n"));
console.log(`✓ wrote mysql-fk.sql (${foreignKeys.length} FKs)`);

// -----------------------------------------------------------------------------
// Step 9 — convert COPY blocks → INSERT statements
// -----------------------------------------------------------------------------
function decodePgCopyField(raw) {
  // \N is NULL; other backslash sequences follow the pg_dump text format.
  if (raw === "\\N") return null;
  let out = "";
  for (let i = 0; i < raw.length; i++) {
    const ch = raw[i];
    if (ch !== "\\") {
      out += ch;
      continue;
    }
    const nxt = raw[i + 1];
    i++;
    if (nxt === "n") out += "\n";
    else if (nxt === "t") out += "\t";
    else if (nxt === "r") out += "\r";
    else if (nxt === "b") out += "\b";
    else if (nxt === "f") out += "\f";
    else if (nxt === "\\") out += "\\";
    else out += nxt; // leave the char as-is if we don't recognise the escape
  }
  return out;
}

function escapeMysqlString(str) {
  return str
    .replace(/\\/g, "\\\\")
    .replace(/'/g, "''")
    .replace(/\n/g, "\\n")
    .replace(/\r/g, "\\r")
    .replace(/\t/g, "\\t")
    .replace(/\x00/g, "");
}

// -----------------------------------------------------------------------------
// Column-type map: table → col → MySQL type family (used by formatValue)
// -----------------------------------------------------------------------------
/** @type {Record<string, Record<string, "bool"|"int"|"decimal"|"json"|"timestamp"|"string">>} */
const columnTypeMap = {};
for (const tbl of tableOrder) {
  columnTypeMap[tbl] = {};
  for (const rawLine of tables[tbl]) {
    const line = rawLine.trim();
    if (line.startsWith("CONSTRAINT ")) continue;
    const m = line.match(/^(\w+)\s+(.*)$/);
    if (!m) continue;
    const name = m[1];
    const t = m[2].toLowerCase();
    let fam = "string";
    if (/^boolean\b/.test(t)) fam = "bool";
    else if (/^bigint\b|^integer\b|^smallint\b/.test(t)) fam = "int";
    else if (/^numeric\b/.test(t)) fam = "decimal";
    else if (/^jsonb?\b/.test(t)) fam = "json";
    else if (/^timestamp\b/.test(t)) fam = "timestamp";
    columnTypeMap[tbl][name] = fam;
  }
}

// URLs stored in product_media.url point to InsForge Storage. Rewrite them to
// the repo-committed asset path — scripts/seed-product-images.mjs already
// downloaded every photo into public/images/products/<slug>/, so Hostinger
// gets them for free with the git deploy (no separate upload step).
//   https://<host>/api/storage/buckets/products/objects/beaumont-14x10%2Fcover.jpg
//   →  /images/products/beaumont-14x10/cover.jpg
function rewriteStorageUrl(url) {
  const m = url.match(
    /\/api\/storage\/buckets\/[^/]+\/objects\/(.+)$/,
  );
  if (!m) return url;
  const key = decodeURIComponent(m[1]); // `%2F` → `/`
  return `/images/products/${key}`;
}

function formatValue(val, col, table) {
  if (val === null) return "NULL";
  const fam = columnTypeMap[table]?.[col] ?? "string";
  if (table === "product_media" && col === "url") val = rewriteStorageUrl(val);
  if (fam === "bool") {
    // pg_dump prints booleans as `t` / `f`. MySQL TINYINT(1) needs 1 / 0.
    if (val === "t" || val === "true") return "1";
    if (val === "f" || val === "false") return "0";
    return val; // unlikely
  }
  if (fam === "int" || fam === "decimal") {
    // Emit unquoted — cleaner and lets MySQL enforce type strictly.
    return val;
  }
  if (fam === "timestamp") {
    // Strip the trailing timezone offset ("+00", "-05:30", "Z") — MySQL's
    // TIMESTAMP column stores UTC internally but doesn't parse the suffix.
    const stripped = val.replace(/([+-]\d{2}(?::?\d{2})?|Z)$/i, "");
    return `'${escapeMysqlString(stripped)}'`;
  }
  // json / string / enum / char / varchar all go through the quoted path.
  return `'${escapeMysqlString(val)}'`;
}

const dataOut = [];
dataOut.push("-- Generated by migration/convert-pg-to-mysql.mjs — do not edit by hand.");
dataOut.push("SET NAMES utf8mb4;");
dataOut.push("SET FOREIGN_KEY_CHECKS = 0;");
dataOut.push("SET UNIQUE_CHECKS = 0;");
dataOut.push("");

const totalByTable = {};

for (let i = 0; i < lines.length; i++) {
  const m = lines[i].match(/^COPY public\.(\w+) \(([^)]+)\) FROM stdin;/);
  if (!m) continue;
  const table = m[1];
  const cols = m[2].split(",").map((s) => s.trim());
  const rows = [];
  for (let j = i + 1; j < lines.length; j++) {
    if (lines[j] === "\\.") break;
    if (lines[j] === "") continue;
    const fields = lines[j].split("\t").map(decodePgCopyField);
    rows.push(fields);
  }
  totalByTable[table] = rows.length;
  if (rows.length === 0) continue;

  const colList = cols.map((c) => `\`${c}\``).join(", ");
  // Chunk into groups of 200 for readable + import-friendly INSERTs.
  const CHUNK = 200;
  for (let start = 0; start < rows.length; start += CHUNK) {
    const slice = rows.slice(start, start + CHUNK);
    dataOut.push(`INSERT INTO \`${table}\` (${colList}) VALUES`);
    slice.forEach((row, idx) => {
      const vals = row.map((v, k) => formatValue(v, cols[k], table)).join(", ");
      const end = idx === slice.length - 1 ? ";" : ",";
      dataOut.push(`  (${vals})${end}`);
    });
    dataOut.push("");
  }
}

dataOut.push("SET UNIQUE_CHECKS = 1;");
dataOut.push("SET FOREIGN_KEY_CHECKS = 1;");

writeFileSync(join(outDir, "mysql-data.sql"), dataOut.join("\n"));
console.log(`✓ wrote mysql-data.sql`);
console.log("  rows per table:");
for (const [t, n] of Object.entries(totalByTable)) {
  console.log(`    ${t.padEnd(28)} ${String(n).padStart(6)}`);
}
