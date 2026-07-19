import { insforge } from "@/lib/insforge";
import type { PergolaProduct, ProductCategory } from "@/features/products/types";

interface ProductRow {
  id: string;
  sku: string;
  slug: string;
  base_price_cents: number;
  is_featured: boolean;
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
  is_cover: boolean;
  sort_order: number;
}

function toPergolaProduct(
  row: ProductRow,
  categorySlug: string,
  translations: TranslationRow[],
  media: MediaRow[],
): PergolaProduct {
  const fr = translations.find((t) => t.locale === "fr") ?? translations[0];
  const cover = media.find((m) => m.is_cover) ?? media[0];
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
    featured: row.is_featured,
    finish: row.finish ?? undefined,
    colorway: (row.colorway ?? "warm-cedar") as PergolaProduct["colorway"],
  };
}

async function loadJoins(productIds: string[]) {
  if (productIds.length === 0)
    return { translations: [], media: [] as MediaRow[] };

  const [{ data: translations }, { data: media }] = await Promise.all([
    insforge.database
      .from("product_translations")
      .select("product_id, locale, name, short_desc")
      .in("product_id", productIds),
    insforge.database
      .from("product_media")
      .select("product_id, url, is_cover, sort_order")
      .in("product_id", productIds)
      .order("sort_order", { ascending: true }),
  ]);

  return {
    translations: (translations ?? []) as TranslationRow[],
    media: (media ?? []) as MediaRow[],
  };
}

async function loadCategoryMap(): Promise<Map<string, string>> {
  const { data } = await insforge.database
    .from("categories")
    .select("id, slug");
  const map = new Map<string, string>();
  ((data ?? []) as CategoryRow[]).forEach((c) => map.set(c.id, c.slug));
  return map;
}

export async function listProducts(): Promise<PergolaProduct[]> {
  const { data, error } = await insforge.database
    .from("products")
    .select(
      "id, sku, slug, base_price_cents, is_featured, family, material, colorway, finish, width_ft, length_ft, width_cm, length_cm, category_id",
    )
    .eq("status", "PUBLISHED")
    .order("is_featured", { ascending: false })
    .order("base_price_cents", { ascending: true });

  if (error) throw error;
  const rows = (data ?? []) as ProductRow[];
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
  const { data, error } = await insforge.database
    .from("products")
    .select(
      "id, sku, slug, base_price_cents, is_featured, family, material, colorway, finish, width_ft, length_ft, width_cm, length_cm, category_id",
    )
    .eq("slug", slug)
    .limit(1);
  if (error) throw error;
  const row = ((data ?? [])[0] ?? null) as ProductRow | null;
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
  const { data, error } = await insforge.database
    .from("products")
    .select(
      "id, sku, slug, base_price_cents, is_featured, family, material, colorway, finish, width_ft, length_ft, width_cm, length_cm, category_id",
    )
    .eq("status", "PUBLISHED")
    .eq("category_id", categoryId)
    .neq("slug", product.slug)
    .limit(limit);
  if (error) throw error;
  const rows = (data ?? []) as ProductRow[];
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
  const { data, error } = await insforge.database
    .from("products")
    .select("slug")
    .eq("status", "PUBLISHED");
  if (error) throw error;
  return ((data ?? []) as { slug: string }[]).map((r) => r.slug);
}
