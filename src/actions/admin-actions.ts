"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { upsertSetting } from "@/repositories/settings-repository";

// ─── Products ────────────────────────────────────────────────────────────

interface ProductInput {
  slug: string;
  sku: string;
  categoryId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  basePriceCents: number;
  stock: number;
  isConfigurable: boolean;
  isFeatured: boolean;
  family?: string;
  material?: string;
  colorway?: string;
  finish?: string;
  widthFt?: number;
  lengthFt?: number;
  widthCm?: number;
  lengthCm?: number;
  nameFr: string;
  nameEn: string;
  taglineFr: string;
  taglineEn: string;
}

export async function createProduct(input: ProductInput) {
  const id = `p-${input.slug}-${Date.now().toString(36)}`;
  const { error: pErr } = await insforgeAdmin.database.from("products").insert([
    {
      id,
      sku: input.sku,
      slug: input.slug,
      category_id: input.categoryId,
      status: input.status,
      base_price_cents: input.basePriceCents,
      stock: input.stock,
      is_configurable: input.isConfigurable,
      is_featured: input.isFeatured,
      family: input.family ?? null,
      material: input.material ?? null,
      colorway: input.colorway ?? null,
      finish: input.finish ?? null,
      width_ft: input.widthFt ?? null,
      length_ft: input.lengthFt ?? null,
      width_cm: input.widthCm ?? null,
      length_cm: input.lengthCm ?? null,
      published_at: input.status === "PUBLISHED" ? new Date().toISOString() : null,
    },
  ]);
  if (pErr) throw pErr;

  await insforgeAdmin.database.from("product_translations").insert([
    { id: id + "-fr", product_id: id, locale: "fr", name: input.nameFr, short_desc: input.taglineFr },
    { id: id + "-en", product_id: id, locale: "en", name: input.nameEn, short_desc: input.taglineEn },
  ]);

  revalidatePath("/", "layout");
  redirect(`/admin/products/${id}`);
}

export async function updateProduct(id: string, input: ProductInput) {
  await insforgeAdmin.database
    .from("products")
    .update({
      sku: input.sku,
      slug: input.slug,
      category_id: input.categoryId,
      status: input.status,
      base_price_cents: input.basePriceCents,
      stock: input.stock,
      is_configurable: input.isConfigurable,
      is_featured: input.isFeatured,
      family: input.family ?? null,
      material: input.material ?? null,
      colorway: input.colorway ?? null,
      finish: input.finish ?? null,
      width_ft: input.widthFt ?? null,
      length_ft: input.lengthFt ?? null,
      width_cm: input.widthCm ?? null,
      length_cm: input.lengthCm ?? null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);

  await insforgeAdmin.database
    .from("product_translations")
    .update({ name: input.nameFr, short_desc: input.taglineFr })
    .eq("product_id", id)
    .eq("locale", "fr");
  await insforgeAdmin.database
    .from("product_translations")
    .update({ name: input.nameEn, short_desc: input.taglineEn })
    .eq("product_id", id)
    .eq("locale", "en");

  revalidatePath("/", "layout");
}

export async function deleteProduct(id: string) {
  await insforgeAdmin.database.from("product_media").delete().eq("product_id", id);
  await insforgeAdmin.database
    .from("product_translations")
    .delete()
    .eq("product_id", id);
  await insforgeAdmin.database.from("products").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/products");
}

// ─── Product media ──────────────────────────────────────────────────────

export async function uploadProductImage(
  productId: string,
  slug: string,
  base64: string,
  mime: string,
  isCover: boolean,
) {
  const buf = Buffer.from(base64.split(",").pop() ?? "", "base64");
  const key = `${slug}/${Date.now()}.${mime.split("/")[1] ?? "jpg"}`;
  const blob = new Blob([buf], { type: mime });
  const file = new File([blob], key.split("/").pop() ?? "img.jpg", { type: mime });

  const { data: uploaded, error } = await insforgeAdmin.storage
    .from("products")
    .upload(key, file);
  if (error) throw error;

  const url =
    (uploaded as { url?: string } | undefined)?.url ??
    `${process.env.INSFORGE_URL}/api/storage/buckets/products/objects/${encodeURIComponent(key)}`;

  const mediaId = `m-${productId}-${Date.now().toString(36)}`;
  await insforgeAdmin.database.from("product_media").insert([
    {
      id: mediaId,
      product_id: productId,
      url,
      alt_text: null,
      type: "IMAGE",
      sort_order: 0,
      is_cover: isCover,
    },
  ]);

  revalidatePath("/", "layout");
  return { url };
}

export async function deleteProductMedia(mediaId: string) {
  await insforgeAdmin.database.from("product_media").delete().eq("id", mediaId);
  revalidatePath("/", "layout");
}

// ─── Categories ─────────────────────────────────────────────────────────

interface CategoryInput {
  slug: string;
  sortOrder: number;
  isFeatured: boolean;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
}

export async function createCategory(input: CategoryInput) {
  const id = `cat-${input.slug}-${Date.now().toString(36)}`;
  await insforgeAdmin.database.from("categories").insert([
    {
      id,
      slug: input.slug,
      sort_order: input.sortOrder,
      is_featured: input.isFeatured,
    },
  ]);
  await insforgeAdmin.database.from("category_translations").insert([
    { id: id + "-fr", category_id: id, locale: "fr", name: input.nameFr, description: input.descriptionFr },
    { id: id + "-en", category_id: id, locale: "en", name: input.nameEn, description: input.descriptionEn },
  ]);
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, input: CategoryInput) {
  await insforgeAdmin.database
    .from("categories")
    .update({
      slug: input.slug,
      sort_order: input.sortOrder,
      is_featured: input.isFeatured,
      updated_at: new Date().toISOString(),
    })
    .eq("id", id);
  await insforgeAdmin.database
    .from("category_translations")
    .update({ name: input.nameFr, description: input.descriptionFr })
    .eq("category_id", id)
    .eq("locale", "fr");
  await insforgeAdmin.database
    .from("category_translations")
    .update({ name: input.nameEn, description: input.descriptionEn })
    .eq("category_id", id)
    .eq("locale", "en");
  revalidatePath("/", "layout");
}

export async function deleteCategory(id: string) {
  await insforgeAdmin.database
    .from("category_translations")
    .delete()
    .eq("category_id", id);
  await insforgeAdmin.database.from("categories").delete().eq("id", id);
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

// ─── Settings ───────────────────────────────────────────────────────────

export async function saveTheme(value: {
  primary: string;
  accent: string;
  background: string;
  foreground: string;
  secondary: string;
  radius: number;
}) {
  await upsertSetting("theme", value);
  revalidatePath("/", "layout");
}

export async function saveSite(value: {
  phone: string;
  email: string;
  showroomAddress: string;
  showroomHours: string;
  instagram: string;
}) {
  await upsertSetting("site", value);
  revalidatePath("/", "layout");
}
