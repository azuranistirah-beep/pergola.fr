import pg from "pg";
import fs from "node:fs";
import path from "node:path";
import "dotenv/config";

const { Pool } = pg;
const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function query(sql, params = []) {
  const c = await pool.connect();
  try {
    return (await c.query(sql, params)).rows;
  } finally {
    c.release();
  }
}

function readJson(req) {
  return new Promise((resolve, reject) => {
    let raw = "";
    req.on("data", (c) => (raw += c));
    req.on("end", () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch (e) {
        reject(e);
      }
    });
    req.on("error", reject);
  });
}

// -------------------- localization helper --------------------
function pickLocale(row, locale = "fr", fields = ["name", "description", "short_desc", "title", "body"]) {
  const suffix = locale === "en" ? "_en" : "_fr";
  const other = locale === "en" ? "_fr" : "_en";
  const out = { ...row };
  for (const f of fields) {
    if (out[f + suffix] !== undefined) {
      out[f] = out[f + suffix] || out[f + other] || null;
      delete out[f + suffix];
      delete out[f + other];
    }
  }
  return out;
}

// -------------------- routes --------------------
const staticRoutes = {
  "GET /api/site-settings": async () => {
    const rows = await query(`SELECT key, value FROM site_settings`);
    return rows.reduce((a, r) => ((a[r.key] = r.value), a), {});
  },
};

const dynamicRoutes = [
  {
    method: "GET",
    pattern: /^\/api\/categories$/,
    handler: async (_m, req) => {
      const url = new URL(req.url, "http://x");
      const locale = url.searchParams.get("locale") || "fr";
      const rows = await query(
        `SELECT id, slug, parent_id, name_fr, name_en, description_fr, description_en,
                image_url, sort_order
         FROM categories WHERE is_active=true
         ORDER BY sort_order ASC, name_fr ASC`
      );
      return rows.map((r) => pickLocale(r, locale));
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/products$/,
    handler: async (_m, req) => {
      const url = new URL(req.url, "http://x");
      const locale = url.searchParams.get("locale") || "fr";
      const cat = url.searchParams.get("category");
      const featured = url.searchParams.get("featured");
      const params = [];
      let where = `p.status='published'`;
      if (cat) {
        params.push(cat);
        where += ` AND c.slug = $${params.length}`;
      }
      if (featured === "1") where += ` AND p.is_featured = true`;
      const rows = await query(
        `SELECT p.id, p.slug, p.sku, p.name_fr, p.name_en, p.short_desc_fr, p.short_desc_en,
                p.price_cents, p.compare_at_cents, p.currency, p.stock_qty, p.in_stock,
                p.images, p.is_featured, p.sort_order,
                c.slug AS category_slug, c.name_fr AS category_name_fr, c.name_en AS category_name_en
         FROM products p LEFT JOIN categories c ON c.id=p.category_id
         WHERE ${where}
         ORDER BY p.sort_order ASC, p.name_fr ASC`,
        params
      );
      return rows.map((r) => {
        const out = pickLocale(r, locale);
        if (r.category_name_fr || r.category_name_en) {
          out.category = pickLocale(
            { name_fr: r.category_name_fr, name_en: r.category_name_en, slug: r.category_slug },
            locale
          );
          delete out.category_name_fr;
          delete out.category_name_en;
          delete out.category_slug;
        }
        return out;
      });
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/products\/([a-z0-9-]+)$/,
    handler: async (m, req) => {
      const url = new URL(req.url, "http://x");
      const locale = url.searchParams.get("locale") || "fr";
      const rows = await query(
        `SELECT p.*, c.slug AS category_slug, c.name_fr AS category_name_fr, c.name_en AS category_name_en
         FROM products p LEFT JOIN categories c ON c.id=p.category_id
         WHERE p.status='published' AND p.slug=$1`,
        [m[1]]
      );
      if (!rows[0]) return null;
      const variants = await query(
        `SELECT id, sku, name_fr, name_en, attributes, price_delta_cents, stock_qty, sort_order
         FROM product_variants WHERE product_id=$1 AND is_active=true
         ORDER BY sort_order ASC`,
        [rows[0].id]
      );
      const p = pickLocale(rows[0], locale, ["name", "short_desc", "description"]);
      if (rows[0].category_slug) {
        p.category = pickLocale(
          { name_fr: rows[0].category_name_fr, name_en: rows[0].category_name_en, slug: rows[0].category_slug },
          locale
        );
      }
      p.variants = variants.map((v) => pickLocale(v, locale, ["name"]));
      delete p.name_fr;
      delete p.name_en;
      delete p.category_name_fr;
      delete p.category_name_en;
      delete p.category_slug;
      return p;
    },
  },
  {
    method: "GET",
    pattern: /^\/api\/pages\/([a-z0-9-]+)$/,
    handler: async (m, req) => {
      const url = new URL(req.url, "http://x");
      const locale = url.searchParams.get("locale") || "fr";
      const rows = await query(
        `SELECT slug, title_fr, title_en, body_fr, body_en, seo_title_fr, seo_title_en,
                seo_description_fr, seo_description_en
         FROM pages WHERE status='published' AND slug=$1`,
        [m[1]]
      );
      if (!rows[0]) return null;
      return pickLocale(rows[0], locale, ["title", "body", "seo_title", "seo_description"]);
    },
  },
  {
    method: "POST",
    pattern: /^\/api\/contact$/,
    handler: async (_m, req) => {
      const b = await readJson(req);
      const { full_name = "", email = "", phone = null, subject = null, message = "", locale = "fr" } = b || {};
      if (!full_name.trim() || !email.trim() || !message.trim()) {
        const e = new Error("Missing required fields");
        e.status = 400;
        throw e;
      }
      const rows = await query(
        `INSERT INTO contacts (full_name, email, phone, subject, message, locale, status)
         VALUES ($1,$2,$3,$4,$5,$6,'new')
         RETURNING id, created_at`,
        [full_name.trim(), email.trim(), phone, subject, message.trim(), locale]
      );
      return { ok: true, ...rows[0] };
    },
  },
];

export function apiMiddleware() {
  return async (req, res, next) => {
    if (!req.url.startsWith("/api/")) return next();
    const path = req.url.split("?")[0];
    const key = `${req.method} ${path}`;
    try {
      let data;
      const s = staticRoutes[key];
      if (s) data = await s(req, res);
      else {
        const m = dynamicRoutes.find((r) => r.method === req.method && r.pattern.test(path));
        if (!m) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Not found" }));
          return;
        }
        data = await m.handler(path.match(m.pattern), req, res);
        if (data === null) {
          res.statusCode = 404;
          res.setHeader("Content-Type", "application/json");
          res.end(JSON.stringify({ error: "Not found" }));
          return;
        }
      }
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.setHeader("Cache-Control", "no-store");
      res.end(JSON.stringify(data));
    } catch (err) {
      const status = err.status || 500;
      if (status >= 500) console.error(`[api] ${key} failed:`, err);
      res.statusCode = status;
      res.setHeader("Content-Type", "application/json");
      res.end(JSON.stringify({ error: status < 500 ? err.message : "Internal server error" }));
    }
  };
}

export function uploadsMiddleware() {
  return (req, res, next) => {
    if (!req.url.startsWith("/uploads/")) return next();
    const clean = req.url.split("?")[0].replace(/\.\./g, "");
    const filePath = path.resolve("public" + clean);
    fs.stat(filePath, (err, st) => {
      if (err || !st.isFile()) return next();
      res.setHeader("Cache-Control", "public, max-age=31536000, immutable");
      fs.createReadStream(filePath).pipe(res);
    });
  };
}
