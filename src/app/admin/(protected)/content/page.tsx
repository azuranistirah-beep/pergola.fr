import { AdminHeader } from "@/features/admin/admin-ui";
import { ContentEditor } from "@/features/admin/content-editor";
import { getContent } from "@/repositories/settings-repository";

export default async function ContentPage() {
  const content = await getContent();
  return (
    <>
      <AdminHeader
        title="Contenu éditorial"
        subtitle="Éditez le hero de la page d'accueil, en français et en anglais."
      />
      <ContentEditor initial={content} />
    </>
  );
}
