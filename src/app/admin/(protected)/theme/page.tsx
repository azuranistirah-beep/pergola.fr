import { AdminHeader } from "@/features/admin/admin-ui";
import { ThemeEditor } from "@/features/admin/theme-editor";
import { getTheme } from "@/repositories/settings-repository";
import { getT } from "@/lib/admin-i18n";

export default async function ThemePage() {
  const [theme, { t }] = await Promise.all([getTheme(), getT()]);
  return (
    <>
      <AdminHeader title={t("theme.title")} subtitle={t("theme.subtitle")} />
      <ThemeEditor initial={theme} />
    </>
  );
}
