import { AdminHeader } from "@/features/admin/admin-ui";
import { SiteSettingsForm } from "@/features/admin/site-settings-form";
import { getSiteInfo } from "@/repositories/settings-repository";

export default async function SettingsPage() {
  const site = await getSiteInfo();
  return (
    <>
      <AdminHeader
        title="Paramètres"
        subtitle="Coordonnées, showroom, réseaux — visibles dans le footer et sur /contact."
      />
      <SiteSettingsForm initial={site} />
    </>
  );
}
