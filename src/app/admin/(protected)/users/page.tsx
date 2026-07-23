import { AdminHeader } from "@/features/admin/admin-ui";
import { UsersManager } from "@/features/admin/users-manager";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { requireAdmin } from "@/lib/admin-auth";
import { getT } from "@/lib/admin-i18n";

interface Row {
  id: string;
  email: string;
  name: string;
  is_active: boolean;
  last_login_at: string | null;
  created_at: string;
}

async function load(): Promise<Row[]> {
  const { data } = await insforgeAdmin.database
    .from("admin_users")
    .select("id, email, name, is_active, last_login_at, created_at")
    .order("created_at", { ascending: true });
  return (data ?? []) as Row[];
}

export default async function AdminUsersPage() {
  const [users, currentUser, { t }] = await Promise.all([
    load(),
    requireAdmin(),
    getT(),
  ]);
  return (
    <>
      <AdminHeader title={t("users.title")} subtitle={t("users.subtitle")} />
      <UsersManager users={users} currentUserId={currentUser.id} />
    </>
  );
}
