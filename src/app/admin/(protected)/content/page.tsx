import { AdminHeader } from "@/features/admin/admin-ui";
import { ContentEditor } from "@/features/admin/content-editor";
import { getContent } from "@/repositories/settings-repository";
import { getT } from "@/lib/admin-i18n";

export default async function ContentPage() {
  const [content, { t }] = await Promise.all([getContent(), getT()]);
  return (
    <>
      <AdminHeader title={t("content.title")} subtitle={t("content.subtitle")} />
      <ContentEditor initial={content} />
    </>
  );
}
