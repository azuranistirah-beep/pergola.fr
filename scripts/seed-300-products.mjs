#!/usr/bin/env node
// Generate 300 pergola products with 3–5 images each, FR + EN translations,
// realistic dimensions and prices (already 20% below typical market rates).
// Reuses the existing InsForge-hosted image pool so photos always load.

import { spawnSync } from "node:child_process";
import { writeFileSync } from "node:fs";

const runSql = (sql) => {
  const r = spawnSync("npx", ["@insforge/cli", "db", "query", sql, "--json"], {
    encoding: "utf8",
  });
  if (r.status !== 0) throw new Error(`SQL failed: ${r.stderr || r.stdout}`);
  const m = r.stdout.match(/\{[\s\S]*\}/);
  return m ? JSON.parse(m[0]) : { rows: [] };
};

// ─── Load category IDs and image pool ────────────────────────────────
const catsRes = runSql("SELECT id, slug FROM categories ORDER BY sort_order;");
const cats = catsRes.rows.map((r) => ({ id: r.id, slug: r.slug }));
if (cats.length === 0) throw new Error("No categories found");

const mediaRes = runSql("SELECT url FROM product_media;");
const imagePool = mediaRes.rows.map((r) => r.url);
if (imagePool.length < 3) throw new Error("Need at least 3 media URLs in pool");

// ─── Product taxonomy ────────────────────────────────────────────────
const families = [
  { key: "beaumont", name: "Beaumont", story: "silhouette classique en cèdre massif" },
  { key: "sarasota", name: "Sarasota", story: "lignes contemporaines, toit à lames orientables" },
  { key: "evanston", name: "Evanston", story: "structure minimaliste, colonnes affinées" },
  { key: "aspen", name: "Aspen", story: "esprit chalet, poutres apparentes" },
  { key: "napa", name: "Napa", story: "aluminium sobre, style vigne californienne" },
  { key: "malibu", name: "Malibu", story: "toit tendu, ambiance ocean-side" },
  { key: "rivoli", name: "Rivoli", story: "colonnes fluted, réf. parisienne" },
  { key: "provence", name: "Provence", story: "poutres provençales, patine warm-cedar" },
  { key: "montauk", name: "Montauk", story: "acier corten, hamptons style" },
  { key: "loire", name: "Loire", story: "cabana à voiles d'ombrage, esprit château" },
  { key: "toscane", name: "Toscane", story: "arches douces, inspiration terracotta" },
  { key: "biarritz", name: "Biarritz", story: "aluminium brossé, tenue mer" },
  { key: "aspenwood", name: "Aspenwood", story: "bois clair Scandinave" },
  { key: "kingston", name: "Kingston", story: "cadre acier noir mat" },
  { key: "portofino", name: "Portofino", story: "voûte bioclimatique automatisée" },
];

const familiesEn = {
  beaumont: "classic silhouette in solid cedar",
  sarasota: "contemporary lines, adjustable louvered roof",
  evanston: "minimalist frame, slim columns",
  aspen: "chalet spirit, exposed beams",
  napa: "understated aluminium, Californian vineyard",
  malibu: "tensioned roof, ocean-side vibe",
  rivoli: "fluted columns, Parisian reference",
  provence: "Provençal beams, warm-cedar patina",
  montauk: "corten steel, Hamptons style",
  loire: "cabana with shade sails, château spirit",
  toscane: "soft arches, terracotta inspiration",
  biarritz: "brushed aluminium, sea-grade",
  aspenwood: "light Scandinavian wood",
  kingston: "matte-black steel frame",
  portofino: "automated bioclimatic canopy",
};

const materials = [
  { key: "wood", labelFr: "cèdre massif", labelEn: "solid cedar", mult: 1 },
  { key: "aluminium", labelFr: "aluminium", labelEn: "aluminium", mult: 1.35 },
  { key: "steel", labelFr: "acier", labelEn: "steel", mult: 1.15 },
];

const colorways = [
  { key: "warm-cedar", fr: "cèdre chaud", en: "warm cedar" },
  { key: "walnut", fr: "noyer", en: "walnut" },
  { key: "barnwood", fr: "barnwood", en: "barnwood" },
  { key: "black", fr: "noir mat", en: "matte black" },
  { key: "white", fr: "blanc pur", en: "pure white" },
];

// Sizes in feet (width × length)
const sizes = [
  { w: 10, l: 10 }, { w: 12, l: 10 }, { w: 12, l: 12 }, { w: 14, l: 10 },
  { w: 14, l: 12 }, { w: 16, l: 10 }, { w: 16, l: 12 }, { w: 18, l: 10 },
  { w: 20, l: 12 }, { w: 24, l: 12 },
];

const finishes = ["Naturel", "Huile", "Lasure", "Peint", "Brossé", "Anodisé"];

// ─── Pricing ─────────────────────────────────────────────────────────
// Baseline EUR TTC per sqft for wood cedar (market-typical premium French)
// Then 20% off already applied to every price.
const BASE_PER_SQFT_EUR = 62; // ~€6000 for a 10x10 wood
const DISCOUNT = 0.8; // 20% below market

function priceCentsFor(sizeSqft, materialMult) {
  const gross = BASE_PER_SQFT_EUR * sizeSqft * materialMult;
  const rounded = Math.round((gross * DISCOUNT) / 10) * 10; // nearest €10
  return rounded * 100; // cents
}

// ─── Generate combinations ───────────────────────────────────────────
const combos = [];
for (const family of families) {
  for (const material of materials) {
    for (const size of sizes) {
      for (const colorway of colorways) {
        combos.push({ family, material, size, colorway });
      }
    }
  }
}

// Shuffle for variety, then take 300.
for (let i = combos.length - 1; i > 0; i--) {
  const j = Math.floor(Math.random() * (i + 1));
  [combos[i], combos[j]] = [combos[j], combos[i]];
}
const selected = combos.slice(0, 300);
console.log(`Selected ${selected.length} product combinations`);

// ─── Escape helpers ─────────────────────────────────────────────────
const sqStr = (s) => `'${String(s ?? "").replace(/'/g, "''")}'`;
const sqNull = (v) =>
  v === null || v === undefined || v === "" ? "NULL" : sqStr(v);

// ─── Emit SQL ────────────────────────────────────────────────────────
const productRows = [];
const trRows = [];
const mediaRows = [];
const usedSlugs = new Set();
const usedSkus = new Set();

function uniq(base, used) {
  let s = base;
  let n = 1;
  while (used.has(s)) s = `${base}-${++n}`;
  used.add(s);
  return s;
}

// Pick a category deterministically by family + material to keep grouping useful
function pickCategoryId({ family, material }) {
  if (material.key === "aluminium") return "cat-alu";
  if (["portofino", "biarritz"].includes(family.key)) return "cat-lame";
  if (["loire", "aspen"].includes(family.key)) return "cat-cabana";
  if (family.key.length % 3 === 0) return "cat-adossee";
  return "cat-bois";
}

let idx = 0;
for (const c of selected) {
  idx++;
  const { family, material, size, colorway } = c;
  const sizeSlug = `${size.w}x${size.l}`;
  const baseSlug = `${family.key}-${material.key}-${sizeSlug}-${colorway.key}`;
  const slug = uniq(baseSlug, usedSlugs);
  const skuBase = `${family.key.slice(0, 3).toUpperCase()}-${material.key.slice(0, 2).toUpperCase()}-${sizeSlug}-${colorway.key.slice(0, 3).toUpperCase()}`;
  const sku = uniq(skuBase, usedSkus);
  const id = `p-${slug}`;
  const sqft = size.w * size.l;
  const priceCents = priceCentsFor(sqft, material.mult);
  const stock = 5 + Math.floor(Math.random() * 20);
  const isFeatured = idx <= 12; // first 12 marked featured
  const catId = pickCategoryId(c);

  productRows.push(
    `(${[
      sqStr(id),
      sqStr(sku),
      sqStr(slug),
      sqStr(catId),
      sqStr("PUBLISHED"),
      priceCents,
      "'EUR'",
      stock,
      "false",
      isFeatured ? "true" : "false",
      sqStr(family.key),
      sqStr(material.key),
      sqStr(colorway.key),
      sqStr(finishes[idx % finishes.length]),
      size.w,
      size.l,
      Math.round(size.w * 30.48),
      Math.round(size.l * 30.48),
      "now()",
    ].join(",")})`,
  );

  const nameFr = `Pergola ${family.name} ${size.w}×${size.l} — ${material.labelFr} ${colorway.fr}`;
  const nameEn = `${family.name} pergola ${size.w}×${size.l} — ${material.labelEn}, ${colorway.en}`;
  const descFr = `${family.name} ${size.w}×${size.l} ft en ${material.labelFr}, finition ${colorway.fr}. ${family.story.charAt(0).toUpperCase() + family.story.slice(1)}. Structure autoportée, kit livré prêt à monter avec quincaillerie et notice détaillée.`;
  const descEn = `${family.name} ${size.w}×${size.l} ft in ${material.labelEn}, ${colorway.en} finish. ${(familiesEn[family.key] || "").charAt(0).toUpperCase() + (familiesEn[family.key] || "").slice(1)}. Free-standing kit, delivered ready to assemble with hardware and detailed instructions.`;
  const tagFr = `Structure ${material.labelFr}, ${size.w}×${size.l} ft.`;
  const tagEn = `${material.labelEn.charAt(0).toUpperCase() + material.labelEn.slice(1)} frame, ${size.w}×${size.l} ft.`;

  trRows.push(
    `(${[sqStr(id + "-fr"), sqStr(id), sqStr("fr"), sqStr(nameFr), sqStr(tagFr), sqStr(descFr)].join(",")})`,
  );
  trRows.push(
    `(${[sqStr(id + "-en"), sqStr(id), sqStr("en"), sqStr(nameEn), sqStr(tagEn), sqStr(descEn)].join(",")})`,
  );

  // Attach 4 images: rotate through pool with an idx-based offset per product.
  const imgCount = 4;
  for (let i = 0; i < imgCount; i++) {
    const poolIdx = (idx * 7 + i * 31) % imagePool.length;
    const url = imagePool[poolIdx];
    const mediaId = `m-${id}-${i}`;
    mediaRows.push(
      `(${[
        sqStr(mediaId),
        sqStr(id),
        sqStr(url),
        "NULL",
        sqStr("IMAGE"),
        i,
        "false",
        i === 0 ? "true" : "false",
      ].join(",")})`,
    );
  }
}

const sqlChunks = [];
sqlChunks.push("BEGIN;");
// Bulk insert products
const productCols =
  "id, sku, slug, category_id, status, base_price_cents, currency, stock, is_configurable, is_featured, family, material, colorway, finish, width_ft, length_ft, width_cm, length_cm, published_at";
sqlChunks.push(
  `INSERT INTO products (${productCols}) VALUES\n${productRows.join(",\n")};`,
);
const trCols = "id, product_id, locale, name, short_desc, description";
sqlChunks.push(
  `INSERT INTO product_translations (${trCols}) VALUES\n${trRows.join(",\n")};`,
);
const mediaCols =
  "id, product_id, url, alt_text, type, sort_order, is_lifestyle, is_cover";
sqlChunks.push(
  `INSERT INTO product_media (${mediaCols}) VALUES\n${mediaRows.join(",\n")};`,
);
sqlChunks.push("COMMIT;");

const outFile = "./scripts/seed-300-products.sql";
writeFileSync(outFile, sqlChunks.join("\n\n"));
console.log(`Wrote ${outFile}`);
console.log(
  `  products: ${productRows.length}, translations: ${trRows.length}, media: ${mediaRows.length}`,
);
