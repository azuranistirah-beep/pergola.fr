import { query } from "@/lib/db";
import type { PergolaProduct, ProductCategory } from "@/features/products/types";

// If the DB is unreachable (build-time prerender without MYSQL_URL, or a
// transient outage), we prefer an empty catalogue over a 500. The alternative
// is marking every consumer page `force-dynamic` and losing static caching.
async function tryQuery<T>(sql: string, params?: unknown[]): Promise<T[]> {
  try {
    return await query<T>(sql, params);
  } catch (err) {
    console.warn(
      "[product-repository] DB read failed, returning empty:",
      err instanceof Error ? err.message : err,
    );
    return [];
  }
}

interface ProductRow {
  id: string;
  sku: string;
  slug: string;
  base_price_cents: number;
  is_featured: number; // MySQL TINYINT(1) → 0/1
  family: string | null;
  material: string | null;
  colorway: string | null;
  finish: string | null;
  width_ft: number | null;
  length_ft: number | null;
  width_cm: number | null;
  length_cm: number | null;
  category_id: string;
}

interface CategoryRow {
  id: string;
  slug: string;
}

interface TranslationRow {
  product_id: string;
  locale: string;
  name: string;
  short_desc: string | null;
}

interface MediaRow {
  product_id: string;
  url: string;
  is_cover: number;
  sort_order: number;
}

const PRODUCT_COLS =
  "id, sku, slug, base_price_cents, is_featured, family, material, " +
  "colorway, finish, width_ft, length_ft, width_cm, length_cm, category_id";

function toPergolaProduct(
  row: ProductRow,
  categorySlug: string,
  translations: TranslationRow[],
  media: MediaRow[],
): PergolaProduct {
  const fr = translations.find((t) => t.locale === "fr") ?? translations[0];
  const cover = media.find((m) => m.is_cover === 1) ?? media[0];
  return {
    slug: row.slug,
    sku: row.sku,
    family: (row.family ?? "beaumont") as PergolaProduct["family"],
    material: (row.material ?? "wood") as PergolaProduct["material"],
    category: categorySlug as ProductCategory,
    name: fr?.name ?? row.slug,
    tagline: fr?.short_desc ?? "",
    widthFt: row.width_ft ?? 12,
    lengthFt: row.length_ft ?? 10,
    widthCm: row.width_cm ?? 366,
    lengthCm: row.length_cm ?? 305,
    priceCents: row.base_price_cents,
    imageCount: 3,
    heroUrl: cover?.url,
    featured: row.is_featured === 1,
    finish: row.finish ?? undefined,
    colorway: (row.colorway ?? "warm-cedar") as PergolaProduct["colorway"],
  };
}

async function loadJoins(productIds: string[]) {
  if (productIds.length === 0)
    return { translations: [] as TranslationRow[], media: [] as MediaRow[] };
  // mysql2 expands a single `?` bound to an array into `(v1, v2, …)` when
  // using `pool.query` (which we do in `query()`).
  const translations = await tryQuery<TranslationRow>(
    "SELECT product_id, locale, name, short_desc FROM product_translations WHERE product_id IN (?)",
    [productIds],
  );
  const media = await tryQuery<MediaRow>(
    "SELECT product_id, url, is_cover, sort_order FROM product_media WHERE product_id IN (?) ORDER BY sort_order ASC",
    [productIds],
  );
  return { translations, media };
}

async function loadCategoryMap(): Promise<Map<string, string>> {
  const rows = await tryQuery<CategoryRow>("SELECT id, slug FROM categories");
  const map = new Map<string, string>();
  rows.forEach((c) => map.set(c.id, c.slug));
  return map;
}

export async function listProducts(): Promise<PergolaProduct[]> {
  const rows = await tryQuery<ProductRow>(
    `SELECT ${PRODUCT_COLS} FROM products WHERE status = ? ` +
      `ORDER BY is_featured DESC, base_price_cents ASC LIMIT 10000`,
    ["PUBLISHED"],
  );
  const [{ translations, media }, catMap] = await Promise.all([
    loadJoins(rows.map((r) => r.id)),
    loadCategoryMap(),
  ]);
  return rows.map((r) =>
    toPergolaProduct(
      r,
      catMap.get(r.category_id) ?? "pergola-bois",
      translations.filter((t) => t.product_id === r.id),
      media.filter((m) => m.product_id === r.id),
    ),
  );
}

export async function getProductBySlug(
  slug: string,
): Promise<PergolaProduct | null> {
  const rows = await tryQuery<ProductRow>(
    `SELECT ${PRODUCT_COLS} FROM products WHERE slug = ? LIMIT 1`,
    [slug],
  );
  const row = rows[0];
  if (!row) return null;
  const [{ translations, media }, catMap] = await Promise.all([
    loadJoins([row.id]),
    loadCategoryMap(),
  ]);
  return toPergolaProduct(
    row,
    catMap.get(row.category_id) ?? "pergola-bois",
    translations,
    media,
  );
}

export async function listRelatedProducts(
  product: PergolaProduct,
  limit = 3,
): Promise<PergolaProduct[]> {
  const catMap = await loadCategoryMap();
  const categoryId = [...catMap.entries()].find(
    ([, slug]) => slug === product.category,
  )?.[0];
  if (!categoryId) return [];
  const rows = await tryQuery<ProductRow>(
    `SELECT ${PRODUCT_COLS} FROM products WHERE status = ? AND category_id = ? AND slug != ? LIMIT ?`,
    ["PUBLISHED", categoryId, product.slug, limit],
  );
  const { translations, media } = await loadJoins(rows.map((r) => r.id));
  return rows.map((r) =>
    toPergolaProduct(
      r,
      catMap.get(r.category_id) ?? "pergola-bois",
      translations.filter((t) => t.product_id === r.id),
      media.filter((m) => m.product_id === r.id),
    ),
  );
}

export async function listProductSlugs(): Promise<string[]> {
  const rows = await tryQuery<{ slug: string }>(
    "SELECT slug FROM products WHERE status = ? LIMIT 10000",
    ["PUBLISHED"],
  );
  return rows.map((r) => r.slug);
}
