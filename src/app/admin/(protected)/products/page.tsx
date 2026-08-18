import Link from "next/link";
import { Plus } from "lucide-react";
import {
  AdminButton,
  AdminHeader,
  AdminSection,
} from "@/features/admin/admin-ui";
import { ProductsTable } from "@/features/admin/products-table";
import { query } from "@/lib/db";
import { getT } from "@/lib/admin-i18n";

interface ProductRow {
  id: string;
  slug: string;
  sku: string;
  status: string;
  base_price_cents: number;
  is_featured: number;
  category_id: string;
}

async function loadProducts() {
  const [products, translations, cats] = await Promise.all([
    query<ProductRow>(
      "SELECT id, slug, sku, status, base_price_cents, is_featured, category_id " +
        "FROM products ORDER BY updated_at DESC LIMIT 10000",
    ),
    query<{ product_id: string; name: string }>(
      "SELECT product_id, name FROM product_translations WHERE locale = ? LIMIT 10000",
      ["fr"],
    ),
    query<{ id: string; slug: string }>("SELECT id, slug FROM categories"),
  ]);

  const nameById = new Map<string, string>();
  translations.forEach((tr) => nameById.set(tr.product_id, tr.name));
  const catSlug = new Map<string, string>();
  cats.forEach((c) => catSlug.set(c.id, c.slug));
  return products.map((p) => ({
    ...p,
    // is_featured is TINYINT(1) in MySQL → hydrate to boolean for the UI.
    is_featured: p.is_featured === 1,
    name: nameById.get(p.id) ?? p.slug,
    categorySlug: catSlug.get(p.category_id) ?? "—",
  }));
}

export default async function ProductsListPage() {
  const [products, { t }] = await Promise.all([loadProducts(), getT()]);
  return (
    <>
      <AdminHeader
        title={t("products.title")}
        subtitle={t("products.subtitle", { n: products.length })}
        actions={
          <Link href="/admin/products/new">
            <AdminButton variant="primary">
              <Plus className="size-4" /> {t("products.new")}
            </AdminButton>
          </Link>
        }
      />
      <AdminSection>
        <ProductsTable products={products} />
      </AdminSection>
    </>
  );
}
