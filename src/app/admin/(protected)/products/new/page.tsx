import { AdminHeader } from "@/features/admin/admin-ui";
import { ProductForm } from "@/features/admin/product-form";
import { query } from "@/lib/db";
import { getT } from "@/lib/admin-i18n";

async function loadCategories() {
  const [cats, tr] = await Promise.all([
    query<{ id: string; slug: string }>(
      "SELECT id, slug FROM categories ORDER BY sort_order ASC",
    ),
    query<{ category_id: string; name: string }>(
      "SELECT category_id, name FROM category_translations WHERE locale = ?",
      ["fr"],
    ),
  ]);
  const label = new Map<string, string>();
  tr.forEach((t) => label.set(t.category_id, t.name));
  return cats.map((c) => ({ id: c.id, label: label.get(c.id) ?? c.slug }));
}

export default async function NewProductPage() {
  const [categories, { t }] = await Promise.all([loadCategories(), getT()]);
  return (
    <>
      <AdminHeader
        title={t("products.newTitle")}
        subtitle={t("products.newSubtitle")}
      />
      <ProductForm
        categories={categories}
        initial={{
          slug: "",
          sku: "",
          categoryId: categories[0]?.id ?? "",
          status: "DRAFT",
          basePriceEur: "0",
          stock: "10",
          isConfigurable: false,
          isFeatured: false,
          family: "",
          material: "",
          colorway: "",
          finish: "",
          widthFt: "",
          lengthFt: "",
          nameFr: "",
          nameEn: "",
          taglineFr: "",
          taglineEn: "",
        }}
      />
    </>
  );
}
