#!/usr/bin/env node
// Seed the local Postgres database with catalog data.
// Usage: `npm run db:seed`

import { PrismaClient } from "@prisma/client";
import { readFile } from "node:fs/promises";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const prisma = new PrismaClient();

const categoryDefs = [
  { slug: "pergola-bois", name: "Pergolas bois", description: "Cèdre massif certifié PEFC." },
  { slug: "pergola-aluminium", name: "Pergolas aluminium", description: "Aluminium extrudé thermolaqué." },
  { slug: "pergola-lame-orientable", name: "Pergolas à lames orientables", description: "Lames pilotables, capteurs pluie/vent." },
  { slug: "pergola-adossee", name: "Pergolas adossées", description: "Fixation murale, gain de place." },
  { slug: "pergola-cabana", name: "Cabanas d'angle", description: "Structures d'angle avec panneaux d'intimité." },
];

async function loadCatalog() {
  // Parse the TS catalog by reading and eval-ing the object literal.
  // Ships without ts-node dependency: extract product objects with regex.
  const src = await readFile(
    join(__dirname, "..", "src", "features", "products", "catalog.ts"),
    "utf-8",
  );
  const products = [];
  const objectRe = /\{\s*slug:\s*"([^"]+)"[^}]+?\}/gs;
  for (const m of src.matchAll(objectRe)) {
    const block = m[0];
    const get = (key) => {
      const r = new RegExp(`${key}:\\s*"([^"]+)"`);
      const q = block.match(r);
      return q ? q[1] : undefined;
    };
    const num = (key) => {
      const r = new RegExp(`${key}:\\s*(\\d+)`);
      const q = block.match(r);
      return q ? Number(q[1]) : undefined;
    };
    const bool = (key) => new RegExp(`${key}:\\s*true`).test(block);
    products.push({
      slug: get("slug"),
      sku: get("sku"),
      family: get("family"),
      material: get("material"),
      category: get("category"),
      name: get("name"),
      tagline: get("tagline"),
      widthFt: num("widthFt"),
      lengthFt: num("lengthFt"),
      widthCm: num("widthCm"),
      lengthCm: num("lengthCm"),
      priceCents: num("priceCents"),
      finish: get("finish"),
      colorway: get("colorway"),
      featured: bool("featured"),
    });
  }
  return products;
}

async function main() {
  console.log("→ Truncating existing data…");
  await prisma.productMedia.deleteMany();
  await prisma.productTranslation.deleteMany();
  await prisma.product.deleteMany();
  await prisma.categoryTranslation.deleteMany();
  await prisma.category.deleteMany();

  console.log("→ Seeding categories…");
  const categoryIdBySlug = {};
  for (const [i, c] of categoryDefs.entries()) {
    const row = await prisma.category.create({
      data: {
        slug: c.slug,
        order: i,
        isFeatured: i < 3,
        translations: {
          create: [
            { locale: "fr", name: c.name, description: c.description },
            { locale: "en", name: c.name, description: c.description },
          ],
        },
      },
    });
    categoryIdBySlug[c.slug] = row.id;
  }

  console.log("→ Seeding products…");
  const products = await loadCatalog();
  let n = 0;
  for (const p of products) {
    if (!p.slug || !categoryIdBySlug[p.category]) continue;
    await prisma.product.create({
      data: {
        sku: p.sku,
        slug: p.slug,
        categoryId: categoryIdBySlug[p.category],
        status: "PUBLISHED",
        basePriceCents: p.priceCents ?? 0,
        stock: 12,
        isConfigurable: p.family === "sarasota" || p.family === "evanston",
        isFeatured: p.featured ?? false,
        publishedAt: new Date(),
        translations: {
          create: [
            { locale: "fr", name: p.name, shortDesc: p.tagline },
            { locale: "en", name: p.name, shortDesc: p.tagline },
          ],
        },
        media: {
          create: [
            { url: `/images/products/${p.slug}/cover.jpg`, type: "IMAGE", isCover: true, order: 0 },
            { url: `/images/products/${p.slug}/1.jpg`, type: "IMAGE", order: 1 },
            { url: `/images/products/${p.slug}/2.jpg`, type: "IMAGE", order: 2 },
            { url: `/images/products/${p.slug}/3.jpg`, type: "IMAGE", order: 3 },
          ],
        },
      },
    });
    n++;
  }
  console.log(`✓ Seeded ${categoryDefs.length} categories and ${n} products.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
