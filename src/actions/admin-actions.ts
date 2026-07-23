"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { upsertSetting } from "@/repositories/settings-repository";
import type { SiteInfoSettings } from "@/repositories/settings-repository";

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
  const { data: existing } = await insforgeAdmin.database
    .from("products")
    .select("status, published_at")
    .eq("id", id)
    .limit(1);
  const prev = (existing ?? [])[0] as
    | { status: string; published_at: string | null }
    | undefined;
  const patch: Record<string, string | number | boolean | null> = {
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
  };
  if (input.status === "PUBLISHED" && !prev?.published_at) {
    patch.published_at = new Date().toISOString();
  }
  await insforgeAdmin.database.from("products").update(patch).eq("id", id);

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

// ─── Bulk product operations ────────────────────────────────────────────

export async function bulkSetProductStatus(
  ids: string[],
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED",
): Promise<number> {
  if (!ids.length) return 0;
  const patch: Record<string, string> = { status };
  if (status === "PUBLISHED") patch.published_at = new Date().toISOString();
  await insforgeAdmin.database.from("products").update(patch).in("id", ids);
  revalidatePath("/", "layout");
  return ids.length;
}

export async function bulkDeleteProducts(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  await insforgeAdmin.database.from("product_media").delete().in("product_id", ids);
  await insforgeAdmin.database
    .from("product_translations")
    .delete()
    .in("product_id", ids);
  await insforgeAdmin.database.from("products").delete().in("id", ids);
  revalidatePath("/", "layout");
  return ids.length;
}

export async function duplicateProduct(id: string): Promise<string> {
  const { data: rows } = await insforgeAdmin.database
    .from("products")
    .select("*")
    .eq("id", id)
    .limit(1);
  const src = (rows ?? [])[0] as Record<string, unknown> | undefined;
  if (!src) throw new Error("Product not found");

  const stamp = Date.now().toString(36);
  const newId = `p-${src.slug}-copy-${stamp}`;
  const newSlug = `${src.slug}-copy-${stamp}`;
  const newSku = `${src.sku}-COPY-${stamp.slice(-4).toUpperCase()}`;

  const insertRow = {
    ...src,
    id: newId,
    slug: newSlug,
    sku: newSku,
    status: "DRAFT",
    is_featured: false,
    published_at: null,
    created_at: undefined,
    updated_at: undefined,
  };
  delete (insertRow as Record<string, unknown>).created_at;
  delete (insertRow as Record<string, unknown>).updated_at;
  const { error } = await insforgeAdmin.database.from("products").insert(insertRow);
  if (error) throw error;

  const { data: trRows } = await insforgeAdmin.database
    .from("product_translations")
    .select("locale, name, short_desc, description, features_json")
    .eq("product_id", id);
  const trs = (trRows ?? []) as {
    locale: string;
    name: string;
    short_desc: string | null;
    description: string | null;
    features_json: unknown;
  }[];
  if (trs.length) {
    await insforgeAdmin.database.from("product_translations").insert(
      trs.map((tr) => ({
        id: `${newId}-${tr.locale}`,
        product_id: newId,
        locale: tr.locale,
        name: `${tr.name} (copy)`,
        short_desc: tr.short_desc,
        description: tr.description,
        features_json: tr.features_json ?? null,
      })),
    );
  }

  const { data: mediaRows } = await insforgeAdmin.database
    .from("product_media")
    .select("url, alt_text, type, sort_order, is_lifestyle, is_cover")
    .eq("product_id", id);
  const media = (mediaRows ?? []) as {
    url: string;
    alt_text: string | null;
    type: string;
    sort_order: number;
    is_lifestyle: boolean;
    is_cover: boolean;
  }[];
  if (media.length) {
    await insforgeAdmin.database.from("product_media").insert(
      media.map((m, i) => ({
        id: `m-${newId}-${i}`,
        product_id: newId,
        url: m.url,
        alt_text: m.alt_text,
        type: m.type,
        sort_order: m.sort_order,
        is_lifestyle: m.is_lifestyle,
        is_cover: m.is_cover,
      })),
    );
  }

  revalidatePath("/admin/products");
  return newId;
}

export async function duplicateProductAndRedirect(id: string) {
  const newId = await duplicateProduct(id);
  redirect(`/admin/products/${newId}`);
}

// ─── Product media ──────────────────────────────────────────────────────

const IMAGE_MIME_TO_EXT: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};
const MAX_IMAGE_BYTES = 5 * 1024 * 1024; // 5 MB

function sanitizeSlug(s: string): string {
  return (s || "misc").toLowerCase().replace(/[^a-z0-9-]+/g, "-").slice(0, 80);
}

function detectImageMime(buf: Buffer): string | null {
  // Magic bytes — trust the file, not the client-provided mime.
  if (buf.length < 12) return null;
  if (buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return "image/jpeg";
  if (
    buf[0] === 0x89 &&
    buf[1] === 0x50 &&
    buf[2] === 0x4e &&
    buf[3] === 0x47
  )
    return "image/png";
  if (
    buf[0] === 0x52 &&
    buf[1] === 0x49 &&
    buf[2] === 0x46 &&
    buf[3] === 0x46 &&
    buf[8] === 0x57 &&
    buf[9] === 0x45 &&
    buf[10] === 0x42 &&
    buf[11] === 0x50
  )
    return "image/webp";
  return null;
}

export async function uploadProductImage(
  productId: string,
  slug: string,
  base64: string,
  mime: string,
  isCover: boolean,
) {
  const buf = Buffer.from(base64.split(",").pop() ?? "", "base64");
  if (buf.length === 0) throw new Error("Empty file");
  if (buf.length > MAX_IMAGE_BYTES)
    throw new Error(
      `File too large (${(buf.length / 1024 / 1024).toFixed(1)} MB). Max is 5 MB.`,
    );

  const detected = detectImageMime(buf);
  if (!detected || !IMAGE_MIME_TO_EXT[detected]) {
    throw new Error("Only JPG, PNG and WebP images are allowed.");
  }
  // If the client-declared mime disagrees with the magic bytes, trust the bytes.
  const safeMime = detected;
  const ext = IMAGE_MIME_TO_EXT[safeMime];
  const safeSlug = sanitizeSlug(slug);
  const key = `${safeSlug}/${Date.now()}.${ext}`;

  const blob = new Blob([buf], { type: safeMime });
  const file = new File([blob], key.split("/").pop() ?? `img.${ext}`, {
    type: safeMime,
  });

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

export async function saveSite(value: SiteInfoSettings) {
  await upsertSetting("site", value);
  revalidatePath("/", "layout");
}
