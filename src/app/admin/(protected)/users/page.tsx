import { AdminHeader } from "@/features/admin/admin-ui";
import { UsersManager } from "@/features/admin/users-manager";
import { query } from "@/lib/db";
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
  // is_active stored as TINYINT(1); the UI expects a boolean.
  const rows = await query<{
    id: string;
    email: string;
    name: string;
    is_active: number;
    last_login_at: string | null;
    created_at: string;
  }>(
    "SELECT id, email, name, is_active, last_login_at, created_at " +
      "FROM admin_users ORDER BY created_at ASC",
  );
  return rows.map((r) => ({ ...r, is_active: r.is_active === 1 }));
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
