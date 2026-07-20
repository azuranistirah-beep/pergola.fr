import { AdminHeader } from "@/features/admin/admin-ui";
import { CategoryForm } from "@/features/admin/category-form";

export default function NewCategoryPage() {
  return (
    <>
      <AdminHeader
        title="Nouvelle catégorie"
        subtitle="Créez une famille produit avec traductions FR / EN"
      />
      <CategoryForm
        initial={{
          slug: "",
          sortOrder: "0",
          isFeatured: false,
          nameFr: "",
          nameEn: "",
          descriptionFr: "",
          descriptionEn: "",
        }}
      />
    </>
  );
}
