import Link from "next/link";
import {
  ArrowUpRight,
  Boxes,
  Eye,
  FileText,
  Image as ImageIcon,
  Inbox,
  Layers,
  Mail,
  Package,
  Palette,
} from "lucide-react";
import {
  AdminCard,
  AdminHeader,
  AdminSection,
  KpiCard,
} from "@/features/admin/admin-ui";
import { query } from "@/lib/db";
import { formatEUR } from "@/lib/utils";
import { getT } from "@/lib/admin-i18n";

async function loadStats() {
  // Aggregate counts in the DB — one round-trip per KPI, cheaper than
  // fetching every row and counting in JS the way the InsForge version did.
  const [
    productCount,
    categoryCount,
    mediaCount,
    draftCount,
    unreadMsgs,
    orders,
    subCount,
  ] = await Promise.all([
    query<{ n: number }>(
      "SELECT COUNT(*) AS n FROM products WHERE status = ?",
      ["PUBLISHED"],
    ),
    query<{ n: number }>("SELECT COUNT(*) AS n FROM categories"),
    query<{ n: number }>("SELECT COUNT(*) AS n FROM product_media"),
    query<{ n: number }>(
      "SELECT COUNT(*) AS n FROM products WHERE status = ?",
      ["DRAFT"],
    ),
    query<{ n: number }>(
      "SELECT COUNT(*) AS n FROM contact_messages WHERE status = ?",
      ["NEW"],
    ),
    query<{ n: number; revenue: number }>(
      "SELECT COUNT(*) AS n, COALESCE(SUM(total_cents), 0) AS revenue " +
        "FROM orders WHERE status != ?",
      ["CANCELLED"],
    ),
    query<{ n: number }>("SELECT COUNT(*) AS n FROM newsletter_subscribers"),
  ]);

  return {
    products: Number(productCount[0]?.n ?? 0),
    categories: Number(categoryCount[0]?.n ?? 0),
    media: Number(mediaCount[0]?.n ?? 0),
    drafts: Number(draftCount[0]?.n ?? 0),
    newMessages: Number(unreadMsgs[0]?.n ?? 0),
    orders: Number(orders[0]?.n ?? 0),
    revenue: Number(orders[0]?.revenue ?? 0),
    subs: Number(subCount[0]?.n ?? 0),
  };
}

async function loadRecentOrders() {
  return query<{
    id: string;
    order_number: string;
    customer_name: string;
    total_cents: number;
    status: string;
    created_at: string;
  }>(
    "SELECT id, order_number, customer_name, total_cents, status, created_at " +
      "FROM orders ORDER BY created_at DESC LIMIT 5",
  );
}

export default async function AdminDashboard() {
  const [c, recent, { t, locale }] = await Promise.all([
    loadStats(),
    loadRecentOrders(),
    getT(),
  ]);
  const shortcuts = [
    {
      href: "/admin/products/new",
      title: t("dashboard.shortcut.newProduct.title"),
      body: t("dashboard.shortcut.newProduct.body"),
      Icon: Boxes,
    },
    {
      href: "/admin/content",
      title: t("dashboard.shortcut.editHero.title"),
      body: t("dashboard.shortcut.editHero.body"),
      Icon: FileText,
    },
    {
      href: "/admin/theme",
      title: t("dashboard.shortcut.theme.title"),
      body: t("dashboard.shortcut.theme.body"),
      Icon: Palette,
    },
    {
      href: "/admin/inbox",
      title: t("dashboard.shortcut.inbox.title"),
      body: t("dashboard.shortcut.inbox.body"),
      Icon: Inbox,
    },
  ];
  const dateLocale = locale === "id" ? "id-ID" : "en-GB";
  return (
    <>
      <AdminHeader
        title={t("dashboard.title")}
        subtitle={t("dashboard.subtitle")}
        actions={
          <Link
            href="/"
            target="_blank"
            className="border-border text-primary hover:border-primary inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs font-medium transition-colors"
          >
            <Eye className="size-3.5" /> {t("dashboard.openSite")}
          </Link>
        }
      />

      <AdminSection>
        <div className="grid gap-4 md:grid-cols-4">
          <KpiCard label={t("dashboard.kpi.revenue")} value={formatEUR(c.revenue)} Icon={Package} />
          <KpiCard
            label={t("dashboard.kpi.orders")}
            value={c.orders}
            hint={c.orders > 0 ? t("dashboard.kpi.ordersActive") : t("dashboard.kpi.ordersNone")}
            Icon={Package}
          />
          <KpiCard label={t("dashboard.kpi.messages")} value={c.newMessages} hint={t("dashboard.kpi.messagesUnread")} Icon={Inbox} />
          <KpiCard label={t("dashboard.kpi.subs")} value={c.subs} Icon={Mail} />
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-4">
          <KpiCard label={t("dashboard.kpi.products")} value={c.products} Icon={Boxes} />
          <KpiCard label={t("dashboard.kpi.drafts")} value={c.drafts} hint={t("dashboard.kpi.draftsHint")} />
          <KpiCard label={t("dashboard.kpi.categories")} value={c.categories} Icon={Layers} />
          <KpiCard label={t("dashboard.kpi.media")} value={c.media} Icon={ImageIcon} />
        </div>
      </AdminSection>

      <AdminSection title={t("dashboard.quickActions")}>
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {shortcuts.map((s) => (
            <Link
              key={s.href}
              href={s.href}
              className="group bg-background border-border/60 hover:border-primary flex flex-col justify-between gap-6 rounded-3xl border p-6 transition-colors"
            >
              <s.Icon className="text-accent size-6" />
              <div>
                <div className="font-serif text-lg">{s.title}</div>
                <p className="text-secondary mt-2 text-xs">{s.body}</p>
                <div className="text-primary mt-4 inline-flex items-center gap-1 text-xs font-medium">
                  {t("dashboard.shortcut.open")}{" "}
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </AdminSection>

      <AdminSection title={t("dashboard.recentOrders")}>
        <AdminCard className="p-0">
          <table className="w-full text-sm">
            <thead className="border-border/60 border-b text-left">
              <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                <th>{t("dashboard.table.reference")}</th>
                <th>{t("dashboard.table.customer")}</th>
                <th className="text-right">{t("dashboard.table.total")}</th>
                <th>{t("dashboard.table.status")}</th>
                <th className="text-right">{t("dashboard.table.date")}</th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {recent.map((o) => (
                <tr key={o.id}>
                  <td className="px-6 py-3 font-mono text-xs">
                    {o.order_number}
                  </td>
                  <td className="text-primary px-6 py-3">
                    {o.customer_name}
                  </td>
                  <td className="text-right px-6 py-3 font-mono">
                    {formatEUR(o.total_cents)}
                  </td>
                  <td className="text-secondary px-6 py-3 text-xs">
                    {o.status.toLowerCase()}
                  </td>
                  <td className="text-secondary text-right px-6 py-3 text-xs">
                    {new Date(o.created_at).toLocaleDateString(dateLocale, {
                      day: "numeric",
                      month: "short",
                    })}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="border-border/60 border-t p-4 text-right">
            <Link
              href="/admin/orders"
              className="text-primary text-xs underline underline-offset-4"
            >
              {t("dashboard.viewAllOrders")}
            </Link>
          </div>
        </AdminCard>
      </AdminSection>
    </>
  );
}
