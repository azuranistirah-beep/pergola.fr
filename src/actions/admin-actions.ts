"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import {
  execute,
  insertMany,
  insertOne,
  query,
  queryOne,
  updateWhere,
  toSqlDate,
} from "@/lib/db";
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
  await insertOne("products", {
    id,
    sku: input.sku,
    slug: input.slug,
    category_id: input.categoryId,
    status: input.status,
    base_price_cents: input.basePriceCents,
    stock: input.stock,
    is_configurable: input.isConfigurable ? 1 : 0,
    is_featured: input.isFeatured ? 1 : 0,
    family: input.family ?? null,
    material: input.material ?? null,
    colorway: input.colorway ?? null,
    finish: input.finish ?? null,
    width_ft: input.widthFt ?? null,
    length_ft: input.lengthFt ?? null,
    width_cm: input.widthCm ?? null,
    length_cm: input.lengthCm ?? null,
    published_at: input.status === "PUBLISHED" ? toSqlDate() : null,
  });

  await insertMany("product_translations", [
    {
      id: id + "-fr",
      product_id: id,
      locale: "fr",
      name: input.nameFr,
      short_desc: input.taglineFr,
    },
    {
      id: id + "-en",
      product_id: id,
      locale: "en",
      name: input.nameEn,
      short_desc: input.taglineEn,
    },
  ]);

  revalidatePath("/", "layout");
  redirect(`/admin/products/${id}`);
}

export async function updateProduct(id: string, input: ProductInput) {
  const prev = await queryOne<{ status: string; published_at: string | null }>(
    "SELECT status, published_at FROM products WHERE id = ? LIMIT 1",
    [id],
  );
  const patch: Record<string, string | number | boolean | null> = {
    sku: input.sku,
    slug: input.slug,
    category_id: input.categoryId,
    status: input.status,
    base_price_cents: input.basePriceCents,
    stock: input.stock,
    is_configurable: input.isConfigurable ? 1 : 0,
    is_featured: input.isFeatured ? 1 : 0,
    family: input.family ?? null,
    material: input.material ?? null,
    colorway: input.colorway ?? null,
    finish: input.finish ?? null,
    width_ft: input.widthFt ?? null,
    length_ft: input.lengthFt ?? null,
    width_cm: input.widthCm ?? null,
    length_cm: input.lengthCm ?? null,
    updated_at: toSqlDate(),
  };
  if (input.status === "PUBLISHED" && !prev?.published_at) {
    patch.published_at = toSqlDate();
  }
  await updateWhere("products", patch, "id = ?", [id]);

  await updateWhere(
    "product_translations",
    { name: input.nameFr, short_desc: input.taglineFr },
    "product_id = ? AND locale = ?",
    [id, "fr"],
  );
  await updateWhere(
    "product_translations",
    { name: input.nameEn, short_desc: input.taglineEn },
    "product_id = ? AND locale = ?",
    [id, "en"],
  );

  revalidatePath("/", "layout");
}

export async function deleteProduct(id: string) {
  await execute("DELETE FROM product_media WHERE product_id = ?", [id]);
  await execute("DELETE FROM product_translations WHERE product_id = ?", [id]);
  await execute("DELETE FROM products WHERE id = ?", [id]);
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
  if (status === "PUBLISHED") patch.published_at = toSqlDate();
  await updateWhere("products", patch, "id IN (?)", [ids]);
  revalidatePath("/", "layout");
  return ids.length;
}

export async function bulkDeleteProducts(ids: string[]): Promise<number> {
  if (!ids.length) return 0;
  await execute("DELETE FROM product_media WHERE product_id IN (?)", [ids]);
  await execute(
    "DELETE FROM product_translations WHERE product_id IN (?)",
    [ids],
  );
  await execute("DELETE FROM products WHERE id IN (?)", [ids]);
  revalidatePath("/", "layout");
  return ids.length;
}

export async function duplicateProduct(id: string): Promise<string> {
  const src = await queryOne<Record<string, unknown>>(
    "SELECT * FROM products WHERE id = ? LIMIT 1",
    [id],
  );
  if (!src) throw new Error("Product not found");

  const stamp = Date.now().toString(36);
  const newId = `p-${src.slug}-copy-${stamp}`;
  const newSlug = `${src.slug}-copy-${stamp}`;
  const newSku = `${src.sku}-COPY-${stamp.slice(-4).toUpperCase()}`;

  const insertRow: Record<string, unknown> = {
    ...src,
    id: newId,
    slug: newSlug,
    sku: newSku,
    status: "DRAFT",
    is_featured: 0,
    published_at: null,
  };
  delete insertRow.created_at;
  delete insertRow.updated_at;
  await insertOne("products", insertRow);

  const translations = await query<{
    locale: string;
    name: string;
    short_desc: string | null;
    description: string | null;
    features_json: unknown;
  }>(
    "SELECT locale, name, short_desc, description, features_json FROM product_translations WHERE product_id = ?",
    [id],
  );
  if (translations.length) {
    await insertMany(
      "product_translations",
      translations.map((tr) => ({
        id: `${newId}-${tr.locale}`,
        product_id: newId,
        locale: tr.locale,
        name: `${tr.name} (copy)`,
        short_desc: tr.short_desc,
        description: tr.description,
        features_json:
          tr.features_json != null ? JSON.stringify(tr.features_json) : null,
      })),
    );
  }

  const media = await query<{
    url: string;
    alt_text: string | null;
    type: string;
    sort_order: number;
    is_lifestyle: number;
    is_cover: number;
  }>(
    "SELECT url, alt_text, type, sort_order, is_lifestyle, is_cover FROM product_media WHERE product_id = ?",
    [id],
  );
  if (media.length) {
    await insertMany(
      "product_media",
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

// Where admin-uploaded images land. Kept OUTSIDE the git-tracked
// public/images/products/ tree (which ships the seed catalogue), so a
// git-based deploy on Hostinger doesn't wipe them. Add `public/uploads/`
// to `.gitignore` — the folder is created on first upload.
const UPLOAD_DIR = join(process.cwd(), "public", "uploads", "products");

export async function uploadProductImage(
  productId: string,
  slug: string,
  base64: string,
  mime: string,
  isCover: boolean,
) {
  void mime; // client-provided mime is untrusted — we detect it below
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
  const ext = IMAGE_MIME_TO_EXT[detected];
  const safeSlug = sanitizeSlug(slug);
  const stamp = Date.now();
  const filename = `${stamp}.${ext}`;

  const dir = join(UPLOAD_DIR, safeSlug);
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), buf);

  // Public-facing URL — Next serves everything under public/ verbatim.
  const url = `/uploads/products/${safeSlug}/${filename}`;

  const mediaId = `m-${productId}-${stamp.toString(36)}`;
  await insertOne("product_media", {
    id: mediaId,
    product_id: productId,
    url,
    alt_text: null,
    type: "IMAGE",
    sort_order: 0,
    is_cover: isCover ? 1 : 0,
  });

  revalidatePath("/", "layout");
  return { url };
}

export async function deleteProductMedia(mediaId: string) {
  await execute("DELETE FROM product_media WHERE id = ?", [mediaId]);
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
  await insertOne("categories", {
    id,
    slug: input.slug,
    sort_order: input.sortOrder,
    is_featured: input.isFeatured ? 1 : 0,
  });
  await insertMany("category_translations", [
    {
      id: id + "-fr",
      category_id: id,
      locale: "fr",
      name: input.nameFr,
      description: input.descriptionFr,
    },
    {
      id: id + "-en",
      category_id: id,
      locale: "en",
      name: input.nameEn,
      description: input.descriptionEn,
    },
  ]);
  revalidatePath("/", "layout");
  redirect("/admin/categories");
}

export async function updateCategory(id: string, input: CategoryInput) {
  await updateWhere(
    "categories",
    {
      slug: input.slug,
      sort_order: input.sortOrder,
      is_featured: input.isFeatured ? 1 : 0,
      updated_at: toSqlDate(),
    },
    "id = ?",
    [id],
  );
  await updateWhere(
    "category_translations",
    { name: input.nameFr, description: input.descriptionFr },
    "category_id = ? AND locale = ?",
    [id, "fr"],
  );
  await updateWhere(
    "category_translations",
    { name: input.nameEn, description: input.descriptionEn },
    "category_id = ? AND locale = ?",
    [id, "en"],
  );
  revalidatePath("/", "layout");
}

export async function deleteCategory(id: string) {
  await execute("DELETE FROM category_translations WHERE category_id = ?", [id]);
  await execute("DELETE FROM categories WHERE id = ?", [id]);
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
