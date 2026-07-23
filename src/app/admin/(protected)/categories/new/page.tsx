import { AdminHeader } from "@/features/admin/admin-ui";
import { CategoryForm } from "@/features/admin/category-form";
import { getT } from "@/lib/admin-i18n";

export default async function NewCategoryPage() {
  const { t } = await getT();
  return (
    <>
      <AdminHeader
        title={t("categories.newTitle")}
        subtitle={t("categories.newSubtitle")}
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
