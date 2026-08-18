import { AdminHeader } from "@/features/admin/admin-ui";
import { OrderCreateForm } from "@/features/admin/order-create-form";
import { query } from "@/lib/db";
import { getT } from "@/lib/admin-i18n";

async function loadProducts() {
  const [products, tr] = await Promise.all([
    query<{
      id: string;
      slug: string;
      sku: string;
      base_price_cents: number;
    }>(
      "SELECT id, slug, sku, base_price_cents FROM products " +
        "WHERE status = ? ORDER BY updated_at DESC",
      ["PUBLISHED"],
    ),
    query<{ product_id: string; name: string }>(
      "SELECT product_id, name FROM product_translations WHERE locale = ?",
      ["fr"],
    ),
  ]);
  const name = new Map<string, string>();
  tr.forEach((row) => name.set(row.product_id, row.name));
  return products.map((p) => ({
    id: p.id,
    label: name.get(p.id) ?? p.slug,
    sku: p.sku,
    slug: p.slug,
    priceCents: p.base_price_cents,
  }));
}

export default async function NewOrderPage() {
  const [products, { t }] = await Promise.all([loadProducts(), getT()]);
  return (
    <>
      <AdminHeader
        title={t("orderCreate.title")}
        subtitle={t("orderCreate.subtitle")}
      />
      <OrderCreateForm products={products} />
    </>
  );
}
