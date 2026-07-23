import { requireAdmin, logoutAdmin } from "@/lib/admin-auth";
import { AdminShell } from "@/features/admin/admin-shell";
import { AdminLocaleToggle } from "@/features/admin/admin-locale-toggle";
import { AdminI18nProvider } from "@/features/admin/admin-i18n-provider";
import { getT, getDict } from "@/lib/admin-i18n";
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
  const { t, locale } = await getT();
  const dict = getDict(locale);
  const labels = {
    role: t("shell.role"),
    viewSite: t("shell.viewSite"),
    logout: t("shell.logout"),
    groups: {
      overview: t("shell.group.overview"),
      catalog: t("shell.group.catalog"),
      sales: t("shell.group.sales"),
      customers: t("shell.group.customers"),
      customization: t("shell.group.customization"),
      system: t("shell.group.system"),
    },
    nav: {
      dashboard: t("shell.nav.dashboard"),
      products: t("shell.nav.products"),
      categories: t("shell.nav.categories"),
      media: t("shell.nav.media"),
      orders: t("shell.nav.orders"),
      invoices: t("shell.nav.invoices"),
      reports: t("shell.nav.reports"),
      inbox: t("shell.nav.inbox"),
      newsletter: t("shell.nav.newsletter"),
      content: t("shell.nav.content"),
      theme: t("shell.nav.theme"),
      settings: t("shell.nav.settings"),
      paymentMethods: t("shell.nav.paymentMethods"),
      users: t("shell.nav.users"),
      account: t("shell.nav.account"),
    },
  };
  return (
    <AdminI18nProvider locale={locale} dict={dict}>
      <AdminShell
        onLogout={onLogout}
        labels={labels}
        localeToggle={
          <AdminLocaleToggle locale={locale} label={t("shell.language")} />
        }
      >
        {children}
      </AdminShell>
    </AdminI18nProvider>
  );
}
