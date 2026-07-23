import Link from "next/link";
import { Plus } from "lucide-react";
import {
  AdminButton,
  AdminHeader,
  AdminSection,
} from "@/features/admin/admin-ui";
import { ProductsTable } from "@/features/admin/products-table";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { getT } from "@/lib/admin-i18n";

async function loadProducts() {
  const { data: products } = await insforgeAdmin.database
    .from("products")
    .select(
      "id, slug, sku, status, base_price_cents, is_featured, category_id",
    )
    .order("updated_at", { ascending: false })
    .limit(10000);
  const { data: translations } = await insforgeAdmin.database
    .from("product_translations")
    .select("product_id, locale, name")
    .eq("locale", "fr")
    .limit(10000);
  const { data: cats } = await insforgeAdmin.database
    .from("categories")
    .select("id, slug");
  const nameById = new Map<string, string>();
  (translations ?? []).forEach((tr) => nameById.set(tr.product_id, tr.name));
  const catSlug = new Map<string, string>();
  (cats ?? []).forEach((c) => catSlug.set(c.id, c.slug));
  return (products ?? []).map((p) => ({
    ...p,
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
