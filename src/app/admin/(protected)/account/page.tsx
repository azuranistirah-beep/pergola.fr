import { AdminHeader } from "@/features/admin/admin-ui";
import { TwoFAManager } from "@/features/admin/two-fa-manager";
import { requireAdmin } from "@/lib/admin-auth";
import { getT } from "@/lib/admin-i18n";

export default async function AccountPage() {
  const [user, { t }] = await Promise.all([requireAdmin(), getT()]);
  return (
    <>
      <AdminHeader
        title={t("account.title")}
        subtitle={`${user.name} · ${user.email}`}
      />
      <TwoFAManager enrolled={user.totp_enabled} />
    </>
  );
}
