import { AdminHeader } from "@/features/admin/admin-ui";
import { SiteSettingsForm } from "@/features/admin/site-settings-form";
import { getSiteInfo } from "@/repositories/settings-repository";
import { getT } from "@/lib/admin-i18n";

export default async function SettingsPage() {
  const [site, { t }] = await Promise.all([getSiteInfo(), getT()]);
  return (
    <>
      <AdminHeader title={t("settings.title")} subtitle={t("settings.subtitle")} />
      <SiteSettingsForm initial={site} />
    </>
  );
}
