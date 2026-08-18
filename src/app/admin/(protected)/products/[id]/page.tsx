import { notFound } from "next/navigation";
import { AdminHeader, AdminSection } from "@/features/admin/admin-ui";
import { ProductForm } from "@/features/admin/product-form";
import { ProductMediaEditor } from "@/features/admin/product-media-editor";
import { query, queryOne } from "@/lib/db";
import { deleteProduct } from "@/actions/admin-actions";
import { getT } from "@/lib/admin-i18n";

interface ProductRow {
  id: string;
  slug: string;
  sku: string;
  category_id: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  base_price_cents: number;
  stock: number;
  is_configurable: number; // TINYINT(1)
  is_featured: number;
  family: string | null;
  material: string | null;
  colorway: string | null;
  finish: string | null;
  width_ft: number | null;
  length_ft: number | null;
}

async function loadEverything(id: string) {
  const product = await queryOne<ProductRow>(
    "SELECT * FROM products WHERE id = ? LIMIT 1",
    [id],
  );
  if (!product) return null;

  const [tr, media, cats, catTr] = await Promise.all([
    query<{ locale: string; name: string; short_desc: string | null }>(
      "SELECT locale, name, short_desc FROM product_translations WHERE product_id = ?",
      [id],
    ),
    query<{ id: string; url: string; is_cover: number; sort_order: number }>(
      "SELECT id, url, is_cover, sort_order FROM product_media WHERE product_id = ? ORDER BY sort_order ASC",
      [id],
    ),
    query<{ id: string; slug: string }>(
      "SELECT id, slug FROM categories ORDER BY sort_order ASC",
    ),
    query<{ category_id: string; locale: string; name: string }>(
      "SELECT category_id, locale, name FROM category_translations WHERE locale = ?",
      ["fr"],
    ),
  ]);

  const label = new Map<string, string>();
  catTr.forEach((t) => label.set(t.category_id, t.name));

  const fr = tr.find((t) => t.locale === "fr");
  const en = tr.find((t) => t.locale === "en");

  return {
    product,
    initial: {
      slug: product.slug,
      sku: product.sku,
      categoryId: product.category_id,
      status: product.status,
      basePriceEur: (product.base_price_cents / 100).toFixed(2),
      stock: String(product.stock),
      isConfigurable: product.is_configurable === 1,
      isFeatured: product.is_featured === 1,
      family: product.family ?? "",
      material: product.material ?? "",
      colorway: product.colorway ?? "",
      finish: product.finish ?? "",
      widthFt: product.width_ft?.toString() ?? "",
      lengthFt: product.length_ft?.toString() ?? "",
      nameFr: fr?.name ?? "",
      nameEn: en?.name ?? "",
      taglineFr: fr?.short_desc ?? "",
      taglineEn: en?.short_desc ?? "",
    },
    media: media.map((m) => ({
      id: m.id,
      url: m.url,
      isCover: m.is_cover === 1,
    })),
    categories: cats.map((c) => ({
      id: c.id,
      label: label.get(c.id) ?? c.slug,
    })),
  };
}

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [data, { t }] = await Promise.all([loadEverything(id), getT()]);
  if (!data) notFound();

  async function handleDelete() {
    "use server";
    await deleteProduct(id);
  }

  return (
    <>
      <AdminHeader
        title={data.initial.nameFr || data.product.slug}
        subtitle={`SKU ${data.product.sku} · /${data.product.slug}`}
      />

      <AdminSection title={t("products.mediaTitle")}>
        <ProductMediaEditor
          productId={data.product.id}
          slug={data.product.slug}
          media={data.media}
        />
      </AdminSection>

      <ProductForm
        productId={data.product.id}
        categories={data.categories}
        initial={data.initial}
        onDelete={handleDelete}
      />
    </>
  );
}
