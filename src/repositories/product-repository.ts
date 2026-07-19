import { prisma } from "@/lib/prisma";
import type { PergolaProduct } from "@/features/products/types";
import { catalog } from "@/features/products/catalog";

const familyByPrefix: Record<string, PergolaProduct["family"]> = {
  beaumont: "beaumont",
  ashland: "ashland",
  somerville: "somerville",
  delray: "delray",
  brendan: "brendan",
  sarasota: "sarasota",
  evanston: "evanston",
  windham: "windham",
  tuscany: "tuscany",
  verona: "verona",
};

function inferFamily(slug: string): PergolaProduct["family"] {
  const first = slug.split("-")[0]!;
  return familyByPrefix[first] ?? "beaumont";
}

function inferMaterial(
  category: string,
): PergolaProduct["material"] {
  if (category === "pergola-aluminium") return "steel";
  if (category === "pergola-lame-orientable" || category === "pergola-adossee")
    return "steel";
  return "wood";
}

function inferColorway(
  category: string,
  slug: string,
): PergolaProduct["colorway"] {
  if (slug.endsWith("-walnut")) return "walnut";
  if (slug.endsWith("-barnwood")) return "barnwood";
  if (category === "pergola-aluminium") return "white";
  if (category === "pergola-lame-orientable" || category === "pergola-adossee")
    return "black";
  return "warm-cedar";
}

interface PrismaProductRow {
  id: string;
  sku: string;
  slug: string;
  basePriceCents: number;
  isFeatured: boolean;
  category: { slug: string } | null;
  translations: { locale: string; name: string; shortDesc: string | null }[];
}

function toPergolaProduct(row: PrismaProductRow): PergolaProduct {
  const t =
    row.translations.find((x) => x.locale === "fr") ?? row.translations[0];
  // Look up dimensions from static catalog (Prisma seed doesn't carry them yet).
  const catalogEntry = catalog.find((p) => p.slug === row.slug);
  const categorySlug = (row.category?.slug ??
    "pergola-bois") as PergolaProduct["category"];
  return {
    slug: row.slug,
    sku: row.sku,
    family: inferFamily(row.slug),
    material: inferMaterial(categorySlug),
    category: categorySlug,
    name: t?.name ?? row.slug,
    tagline: t?.shortDesc ?? "",
    widthFt: catalogEntry?.widthFt ?? 12,
    lengthFt: catalogEntry?.lengthFt ?? 10,
    widthCm: catalogEntry?.widthCm ?? 366,
    lengthCm: catalogEntry?.lengthCm ?? 305,
    priceCents: row.basePriceCents,
    imageCount: 3,
    featured: row.isFeatured,
    finish: catalogEntry?.finish,
    colorway: inferColorway(categorySlug, row.slug),
  };
}

export async function listProducts(): Promise<PergolaProduct[]> {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    orderBy: [{ isFeatured: "desc" }, { basePriceCents: "asc" }],
    include: {
      category: { select: { slug: true } },
      translations: { where: { locale: { in: ["fr", "en"] } } },
    },
  });
  return rows.map(toPergolaProduct);
}

export async function getProductBySlug(
  slug: string,
): Promise<PergolaProduct | null> {
  const row = await prisma.product.findUnique({
    where: { slug },
    include: {
      category: { select: { slug: true } },
      translations: { where: { locale: { in: ["fr", "en"] } } },
    },
  });
  return row ? toPergolaProduct(row) : null;
}

export async function listRelatedProducts(
  product: PergolaProduct,
  limit = 3,
): Promise<PergolaProduct[]> {
  const rows = await prisma.product.findMany({
    where: {
      status: "PUBLISHED",
      slug: { not: product.slug },
      category: { slug: product.category },
    },
    take: limit,
    include: {
      category: { select: { slug: true } },
      translations: { where: { locale: { in: ["fr", "en"] } } },
    },
  });
  return rows.map(toPergolaProduct);
}

export async function listProductSlugs(): Promise<string[]> {
  const rows = await prisma.product.findMany({
    where: { status: "PUBLISHED" },
    select: { slug: true },
  });
  return rows.map((r) => r.slug);
}
