import { notFound } from "next/navigation";
import { AdminHeader } from "@/features/admin/admin-ui";
import { CategoryForm } from "@/features/admin/category-form";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { deleteCategory } from "@/actions/admin-actions";

async function load(id: string) {
  const { data } = await insforgeAdmin.database
    .from("categories")
    .select("id, slug, sort_order, is_featured")
    .eq("id", id)
    .limit(1);
  const cat = ((data ?? [])[0] ?? null) as {
    id: string;
    slug: string;
    sort_order: number;
    is_featured: boolean;
  } | null;
  if (!cat) return null;
  const { data: tr } = await insforgeAdmin.database
    .from("category_translations")
    .select("locale, name, description")
    .eq("category_id", id);
  const fr = (tr ?? []).find((t) => t.locale === "fr");
  const en = (tr ?? []).find((t) => t.locale === "en");
  return {
    id: cat.id,
    initial: {
      slug: cat.slug,
      sortOrder: String(cat.sort_order),
      isFeatured: cat.is_featured,
      nameFr: fr?.name ?? "",
      nameEn: en?.name ?? "",
      descriptionFr: fr?.description ?? "",
      descriptionEn: en?.description ?? "",
    },
  };
}

export default async function EditCategoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = await load(id);
  if (!data) notFound();

  async function handleDelete() {
    "use server";
    await deleteCategory(id);
  }

  return (
    <>
      <AdminHeader
        title={data.initial.nameFr || data.initial.slug}
        subtitle={`/${data.initial.slug}`}
      />
      <CategoryForm
        categoryId={data.id}
        initial={data.initial}
        onDelete={handleDelete}
      />
    </>
  );
}
