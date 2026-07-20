import { notFound } from "next/navigation";
import { AdminHeader, AdminSection } from "@/features/admin/admin-ui";
import { ProductForm } from "@/features/admin/product-form";
import { ProductMediaEditor } from "@/features/admin/product-media-editor";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { deleteProduct } from "@/actions/admin-actions";

async function loadEverything(id: string) {
  const { data: rows } = await insforgeAdmin.database
    .from("products")
    .select("*")
    .eq("id", id)
    .limit(1);
  const product = ((rows ?? [])[0] ?? null) as
    | {
        id: string;
        slug: string;
        sku: string;
        category_id: string;
        status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
        base_price_cents: number;
        stock: number;
        is_configurable: boolean;
        is_featured: boolean;
        family: string | null;
        material: string | null;
        colorway: string | null;
        finish: string | null;
        width_ft: number | null;
        length_ft: number | null;
      }
    | null;
  if (!product) return null;

  const { data: tr } = await insforgeAdmin.database
    .from("product_translations")
    .select("locale, name, short_desc")
    .eq("product_id", id);
  const { data: media } = await insforgeAdmin.database
    .from("product_media")
    .select("id, url, is_cover, sort_order")
    .eq("product_id", id)
    .order("sort_order", { ascending: true });
  const { data: cats } = await insforgeAdmin.database
    .from("categories")
    .select("id, slug")
    .order("sort_order", { ascending: true });
  const { data: catTr } = await insforgeAdmin.database
    .from("category_translations")
    .select("category_id, locale, name")
    .eq("locale", "fr");
  const label = new Map<string, string>();
  (catTr ?? []).forEach((t) => label.set(t.category_id, t.name));

  const fr = (tr ?? []).find((t) => t.locale === "fr");
  const en = (tr ?? []).find((t) => t.locale === "en");

  return {
    product,
    initial: {
      slug: product.slug,
      sku: product.sku,
      categoryId: product.category_id,
      status: product.status,
      basePriceEur: (product.base_price_cents / 100).toFixed(2),
      stock: String(product.stock),
      isConfigurable: product.is_configurable,
      isFeatured: product.is_featured,
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
    media: (media ?? []).map((m) => ({
      id: m.id,
      url: m.url,
      isCover: m.is_cover,
    })),
    categories: (cats ?? []).map((c) => ({
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
  const data = await loadEverything(id);
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

      <AdminSection title="Images produit">
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
