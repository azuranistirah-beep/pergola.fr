import { AdminHeader } from "@/features/admin/admin-ui";
import { OrderCreateForm } from "@/features/admin/order-create-form";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { getT } from "@/lib/admin-i18n";

async function loadProducts() {
  const { data: products } = await insforgeAdmin.database
    .from("products")
    .select("id, slug, sku, base_price_cents, status")
    .eq("status", "PUBLISHED")
    .order("updated_at", { ascending: false });
  const { data: tr } = await insforgeAdmin.database
    .from("product_translations")
    .select("product_id, locale, name")
    .eq("locale", "fr");
  const name = new Map<string, string>();
  (tr ?? []).forEach((row) => name.set(row.product_id, row.name));
  return (products ?? []).map((p) => ({
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
