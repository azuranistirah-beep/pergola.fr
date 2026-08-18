import { notFound } from "next/navigation";
import { AdminHeader } from "@/features/admin/admin-ui";
import { CategoryForm } from "@/features/admin/category-form";
import { query, queryOne } from "@/lib/db";
import { deleteCategory } from "@/actions/admin-actions";

async function load(id: string) {
  const cat = await queryOne<{
    id: string;
    slug: string;
    sort_order: number;
    is_featured: number;
  }>(
    "SELECT id, slug, sort_order, is_featured FROM categories WHERE id = ? LIMIT 1",
    [id],
  );
  if (!cat) return null;
  const tr = await query<{
    locale: string;
    name: string;
    description: string | null;
  }>(
    "SELECT locale, name, description FROM category_translations WHERE category_id = ?",
    [id],
  );
  const fr = tr.find((t) => t.locale === "fr");
  const en = tr.find((t) => t.locale === "en");
  return {
    id: cat.id,
    initial: {
      slug: cat.slug,
      sortOrder: String(cat.sort_order),
      isFeatured: cat.is_featured === 1,
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
