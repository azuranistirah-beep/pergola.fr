import { Mail } from "lucide-react";
import {
  AdminHeader,
  AdminSection,
  KpiCard,
} from "@/features/admin/admin-ui";
import {
  NewsletterExport,
  UnsubscribeButton,
} from "@/features/admin/newsletter-actions";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { getT } from "@/lib/admin-i18n";

interface Subscriber {
  email: string;
  locale: string;
  subscribed_at: string;
  unsubscribed_at: string | null;
}

async function load() {
  const { data } = await insforgeAdmin.database
    .from("newsletter_subscribers")
    .select("*")
    .order("subscribed_at", { ascending: false });
  return (data ?? []) as Subscriber[];
}

export default async function NewsletterPage() {
  const [rows, { t, locale }] = await Promise.all([load(), getT()]);
  const active = rows.filter((r) => !r.unsubscribed_at);
  const dateLocale = locale === "id" ? "id-ID" : "en-GB";
  return (
    <>
      <AdminHeader
        title={t("newsletter.title")}
        subtitle={t("newsletter.subtitle")}
        actions={<NewsletterExport rows={active} />}
      />

      <AdminSection>
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard label={t("newsletter.kpi.active")} value={active.length} Icon={Mail} />
          <KpiCard
            label={t("newsletter.kpi.unsubscribed")}
            value={rows.length - active.length}
            hint={t("newsletter.kpi.unsubscribedHint")}
          />
          <KpiCard
            label={t("newsletter.kpi.localeFr")}
            value={active.filter((r) => r.locale === "fr").length}
          />
        </div>
      </AdminSection>

      <AdminSection>
        <div className="bg-background border-border/60 overflow-hidden rounded-3xl border">
          <table className="w-full text-sm">
            <thead className="border-border/60 border-b text-left">
              <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                <th>{t("common.email")}</th>
                <th>{t("common.locale")}</th>
                <th>{t("newsletter.table.subscribedAt")}</th>
                <th>{t("common.status")}</th>
                <th className="w-16 text-right"></th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {rows.map((s) => (
                <tr key={s.email} className="hover:bg-muted/40">
                  <td className="text-primary px-6 py-4 font-medium">{s.email}</td>
                  <td className="text-secondary px-6 py-4 text-xs uppercase">
                    {s.locale}
                  </td>
                  <td className="text-secondary px-6 py-4 text-xs">
                    {new Date(s.subscribed_at).toLocaleString(dateLocale, {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    {s.unsubscribed_at ? (
                      <span className="text-secondary text-xs">
                        {t("newsletter.status.unsubscribed")}
                      </span>
                    ) : (
                      <span className="bg-accent/15 text-accent rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                        {t("newsletter.status.active")}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    {!s.unsubscribed_at && (
                      <UnsubscribeButton email={s.email} />
                    )}
                  </td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="text-secondary p-12 text-center text-sm"
                  >
                    {t("newsletter.empty")}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminSection>
    </>
  );
}
