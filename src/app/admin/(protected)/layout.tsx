import { requireAdmin, logoutAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/features/admin/admin-shell";
import { redirect } from "next/navigation";

async function onLogout() {
  "use server";
  await logoutAdmin();
  redirect("/admin/login");
}

export default async function ProtectedAdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  await requireAdmin();
  return <AdminShell onLogout={onLogout}>{children}</AdminShell>;
}
