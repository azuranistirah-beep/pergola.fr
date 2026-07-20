import { AdminHeader } from "@/features/admin/admin-ui";
import { ProductForm } from "@/features/admin/product-form";
import { insforgeAdmin } from "@/lib/insforge-admin";

async function loadCategories() {
  const { data: cats } = await insforgeAdmin.database
    .from("categories")
    .select("id, slug")
    .order("sort_order", { ascending: true });
  const { data: tr } = await insforgeAdmin.database
    .from("category_translations")
    .select("category_id, locale, name")
    .eq("locale", "fr");
  const label = new Map<string, string>();
  (tr ?? []).forEach((t) => label.set(t.category_id, t.name));
  return (cats ?? []).map((c) => ({ id: c.id, label: label.get(c.id) ?? c.slug }));
}

export default async function NewProductPage() {
  const categories = await loadCategories();
  return (
    <>
      <AdminHeader
        title="Nouveau produit"
        subtitle="Créez un produit avec traductions FR / EN"
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
