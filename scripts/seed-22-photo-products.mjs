#!/usr/bin/env node
// Create 22 pergola products matching the reference photos the user provided.
// Each product has a unique family/material/color/size derived from the photo,
// realistic pricing (20% below market), and 3 placeholder images pulled from
// the existing InsForge storage pool. The admin then uploads the real photo
// per product via /admin/products/[id].

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

const mediaRes = runSql("SELECT url FROM product_media LIMIT 60;");
const imagePool = mediaRes.rows.map((r) => r.url);
if (imagePool.length < 3) throw new Error("Image pool too small");

// ─── 22 photo-referenced products ────────────────────────────────────
// Each entry maps to ONE of the 22 photos in the order they were sent.
// Photos with similar subjects use different sizes/colors so the range
// still reads as distinct SKUs, not duplicates.
const items = [
  { key: 1,  ref: "Cedar swings + outdoor kitchen",         family: "provence",  familyName: "Provence",  material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 14, l: 12, cat: "cat-bois",    finish: "Huile mate",   feat: true },
  { key: 2,  ref: "Cedar + fabric canopy tropical",         family: "malibu",    familyName: "Malibu",    material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 12, l: 12, cat: "cat-cabana",  finish: "Naturel",      feat: true },
  { key: 3,  ref: "Steel frame + fabric canopy patio",      family: "kingston",  familyName: "Kingston",  material: "steel",      mat: "acier",       matEn: "steel",           color: "black",      colorFr: "noir mat",     colorEn: "matte black", w: 14, l: 10, cat: "cat-adossee", finish: "Époxy noir",   feat: false },
  { key: 4,  ref: "Cedar attached front porch",              family: "provence",  familyName: "Provence",  material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 16, l: 8,  cat: "cat-adossee", finish: "Lasure",       feat: false },
  { key: 5,  ref: "Cedar porch with couple",                 family: "provence",  familyName: "Provence",  material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 14, l: 8,  cat: "cat-adossee", finish: "Lasure",       feat: false },
  { key: 6,  ref: "White aluminium + vines pool",            family: "napa",      familyName: "Napa",      material: "aluminium",  mat: "aluminium",   matEn: "aluminium",       color: "white",      colorFr: "blanc pur",    colorEn: "pure white",  w: 16, l: 14, cat: "cat-alu",     finish: "Poudré RAL 9010", feat: true },
  { key: 7,  ref: "Steel louvered roof patio",               family: "portofino", familyName: "Portofino", material: "steel",      mat: "acier",       matEn: "steel",           color: "black",      colorFr: "noir mat",     colorEn: "matte black", w: 14, l: 12, cat: "cat-lame",    finish: "Époxy noir",   feat: true },
  { key: 8,  ref: "Black aluminium louvered",                family: "portofino", familyName: "Portofino", material: "aluminium",  mat: "aluminium",   matEn: "aluminium",       color: "black",      colorFr: "noir mat",     colorEn: "matte black", w: 16, l: 12, cat: "cat-lame",    finish: "Poudré RAL 9005", feat: true },
  { key: 9,  ref: "Cedar + fabric canopy poolside",          family: "aspen",     familyName: "Aspen",     material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 14, l: 12, cat: "cat-bois",    finish: "Huile mate",   feat: false },
  { key: 10, ref: "Steel + wood combo dining",               family: "montauk",   familyName: "Montauk",   material: "steel",      mat: "acier + bois",matEn: "steel + wood",    color: "walnut",     colorFr: "noyer",        colorEn: "walnut",      w: 14, l: 10, cat: "cat-adossee", finish: "Corten",       feat: false },
  { key: 11, ref: "White colonial dining pergola",           family: "rivoli",    familyName: "Rivoli",    material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "white",      colorFr: "blanc pur",    colorEn: "pure white",  w: 14, l: 14, cat: "cat-bois",    finish: "Peinture",     feat: false },
  { key: 12, ref: "Large white lattice pergola",             family: "rivoli",    familyName: "Rivoli",    material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "white",      colorFr: "blanc pur",    colorEn: "pure white",  w: 18, l: 14, cat: "cat-bois",    finish: "Peinture",     feat: true },
  { key: 13, ref: "Cedar swings alternate",                  family: "provence",  familyName: "Provence",  material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 14, l: 10, cat: "cat-bois",    finish: "Huile mate",   feat: false },
  { key: 14, ref: "Cedar porch couple portrait A",           family: "provence",  familyName: "Provence",  material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 14, l: 8,  cat: "cat-adossee", finish: "Lasure",       feat: false },
  { key: 15, ref: "Cedar porch couple portrait B",           family: "provence",  familyName: "Provence",  material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 12, l: 8,  cat: "cat-adossee", finish: "Lasure",       feat: false },
  { key: 16, ref: "Modern white bioclimatic villa",          family: "portofino", familyName: "Portofino", material: "aluminium",  mat: "aluminium",   matEn: "aluminium",       color: "white",      colorFr: "blanc pur",    colorEn: "pure white",  w: 18, l: 12, cat: "cat-lame",    finish: "Poudré RAL 9010", feat: true },
  { key: 17, ref: "Louvered wood tilted",                    family: "sarasota",  familyName: "Sarasota",  material: "wood",       mat: "cèdre",       matEn: "cedar",           color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 12, l: 12, cat: "cat-lame",    finish: "Naturel",      feat: false },
  { key: 18, ref: "Modern wood + steel enclosed",            family: "toscane",   familyName: "Toscane",   material: "steel",      mat: "acier + bois",matEn: "steel + wood",    color: "walnut",     colorFr: "noyer",        colorEn: "walnut",      w: 14, l: 12, cat: "cat-adossee", finish: "Corten",       feat: false },
  { key: 19, ref: "Indoor-outdoor palm trees",               family: "biarritz",  familyName: "Biarritz",  material: "aluminium",  mat: "aluminium",   matEn: "aluminium",       color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 14, l: 10, cat: "cat-alu",     finish: "Brossé bronze", feat: true },
  { key: 20, ref: "Beige aluminium louvered A",              family: "portofino", familyName: "Portofino", material: "aluminium",  mat: "aluminium",   matEn: "aluminium",       color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 14, l: 10, cat: "cat-lame",    finish: "Poudré sable", feat: false },
  { key: 21, ref: "Beige aluminium louvered B",              family: "portofino", familyName: "Portofino", material: "aluminium",  mat: "aluminium",   matEn: "aluminium",       color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 12, l: 10, cat: "cat-lame",    finish: "Poudré sable", feat: false },
  { key: 22, ref: "Beige aluminium louvered C",              family: "portofino", familyName: "Portofino", material: "aluminium",  mat: "aluminium",   matEn: "aluminium",       color: "warm-cedar", colorFr: "cèdre chaud", colorEn: "warm cedar",  w: 16, l: 10, cat: "cat-lame",    finish: "Poudré sable", feat: true },
];

// ─── Pricing (20% below market) ──────────────────────────────────────
const priceMap = {
  wood: 62,        // €/sqft baseline
  steel: 74,
  aluminium: 88,   // premium, bioclimatic
};
function priceCentsFor(sqft, material) {
  const gross = priceMap[material] * sqft;
  const disc = Math.round((gross * 0.8) / 10) * 10;
  return disc * 100;
}

// ─── SQL emit ────────────────────────────────────────────────────────
const sqStr = (s) => `'${String(s ?? "").replace(/'/g, "''")}'`;

const productRows = [];
const trRows = [];
const mediaRows = [];
const mappingTable = [];

items.forEach((it, idx) => {
  const sizeSlug = `${it.w}x${it.l}`;
  const baseSlug = `photo-${String(it.key).padStart(2, "0")}-${it.family}-${it.material}-${sizeSlug}-${it.color}`;
  const slug = baseSlug;
  const id = `p-${slug}`;
  const skuBase = `PH${String(it.key).padStart(2, "0")}-${it.family.slice(0, 3).toUpperCase()}-${it.material.slice(0, 2).toUpperCase()}-${sizeSlug}`;
  const sku = skuBase;
  const sqft = it.w * it.l;
  const priceCents = priceCentsFor(sqft, it.material);
  const priceEur = priceCents / 100;

  productRows.push(
    `(${[
      sqStr(id), sqStr(sku), sqStr(slug), sqStr(it.cat), sqStr("PUBLISHED"),
      priceCents, "'EUR'", 8, "false", it.feat ? "true" : "false",
      sqStr(it.family), sqStr(it.material), sqStr(it.color), sqStr(it.finish),
      it.w, it.l, Math.round(it.w * 30.48), Math.round(it.l * 30.48), "now()",
    ].join(",")})`,
  );

  const nameFr = `Pergola ${it.familyName} ${it.w}×${it.l} — ${it.mat} ${it.colorFr}`;
  const nameEn = `${it.familyName} pergola ${it.w}×${it.l} — ${it.matEn}, ${it.colorEn}`;
  const specFr = `Structure ${it.mat} ${it.colorFr}, ${it.w}×${it.l} ft (${Math.round(it.w * 0.3048 * 10) / 10} × ${Math.round(it.l * 0.3048 * 10) / 10} m). Finition ${it.finish}. Emprise au sol ${sqft} sqft (${Math.round(sqft * 0.0929)} m²). Poteaux ${it.material === "aluminium" ? "aluminium extrudé 10×10 cm" : it.material === "steel" ? "acier profilé 8×8 cm" : "cèdre massif 15×15 cm"}. Livraison France sous 4 à 6 semaines. Kit prêt à monter avec quincaillerie inox, notice illustrée et service SAV 10 ans.`;
  const specEn = `${it.matEn.charAt(0).toUpperCase() + it.matEn.slice(1)} frame in ${it.colorEn}, ${it.w}×${it.l} ft (${Math.round(it.w * 0.3048 * 10) / 10} × ${Math.round(it.l * 0.3048 * 10) / 10} m). ${it.finish} finish. Footprint ${sqft} sqft (${Math.round(sqft * 0.0929)} m²). Posts ${it.material === "aluminium" ? "extruded aluminium 10×10 cm" : it.material === "steel" ? "steel profile 8×8 cm" : "solid cedar 15×15 cm"}. France delivery 4–6 weeks. Ready-to-assemble kit, stainless hardware, illustrated manual, 10-year after-sales service.`;
  const tagFr = `${it.mat} · ${it.w}×${it.l} ft · ${it.colorFr}`;
  const tagEn = `${it.matEn} · ${it.w}×${it.l} ft · ${it.colorEn}`;

  trRows.push(`(${[sqStr(id + "-fr"), sqStr(id), sqStr("fr"), sqStr(nameFr), sqStr(tagFr), sqStr(specFr)].join(",")})`);
  trRows.push(`(${[sqStr(id + "-en"), sqStr(id), sqStr("en"), sqStr(nameEn), sqStr(tagEn), sqStr(specEn)].join(",")})`);

  // 3 placeholder images — user replaces with real photos via admin panel.
  for (let i = 0; i < 3; i++) {
    const poolIdx = (idx * 11 + i * 17) % imagePool.length;
    const url = imagePool[poolIdx];
    mediaRows.push(`(${[
      sqStr(`m-${id}-${i}`), sqStr(id), sqStr(url), "NULL",
      sqStr("IMAGE"), i, "false", i === 0 ? "true" : "false",
    ].join(",")})`);
  }

  mappingTable.push({
    photo: `#${it.key}`,
    ref: it.ref,
    slug,
    editUrl: `/admin/products/${id}`,
    priceEur,
  });
});

const productCols = "id, sku, slug, category_id, status, base_price_cents, currency, stock, is_configurable, is_featured, family, material, colorway, finish, width_ft, length_ft, width_cm, length_cm, published_at";
const trCols = "id, product_id, locale, name, short_desc, description";
const mediaCols = "id, product_id, url, alt_text, type, sort_order, is_lifestyle, is_cover";

writeFileSync(
  "./scripts/seed-22-photo-products.sql",
  [
    `INSERT INTO products (${productCols}) VALUES\n${productRows.join(",\n")};`,
    `INSERT INTO product_translations (${trCols}) VALUES\n${trRows.join(",\n")};`,
    `INSERT INTO product_media (${mediaCols}) VALUES\n${mediaRows.join(",\n")};`,
  ].join("\n\n"),
);

writeFileSync(
  "./scripts/seed-22-photo-products.mapping.md",
  [
    "# Photo → Product mapping",
    "",
    "Upload the corresponding real photo via each product's Edit page. Placeholders load in the meantime.",
    "",
    "| Photo | Family | Size | Price | Edit page | Ref |",
    "|-------|--------|------|-------|-----------|-----|",
    ...mappingTable.map(
      (m) => `| ${m.photo} | ${m.slug.split("-").slice(2, 4).join(" ")} | ${m.slug.split("-")[4]} | €${m.priceEur.toLocaleString("fr-FR")} | \`${m.editUrl}\` | ${m.ref} |`,
    ),
  ].join("\n"),
);

console.log(`Products: ${productRows.length}, translations: ${trRows.length}, media: ${mediaRows.length}`);
console.log("Wrote scripts/seed-22-photo-products.sql");
console.log("Wrote scripts/seed-22-photo-products.mapping.md");
