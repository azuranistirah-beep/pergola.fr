import { AdminHeader } from "@/features/admin/admin-ui";
import { ThemeEditor } from "@/features/admin/theme-editor";
import { getTheme } from "@/repositories/settings-repository";

export default async function ThemePage() {
  const theme = await getTheme();
  return (
    <>
      <AdminHeader
        title="Thème"
        subtitle="Couleurs, radius et palettes prédéfinies. Appliqué instantanément sur tout le site."
      />
      <ThemeEditor initial={theme} />
    </>
  );
}
