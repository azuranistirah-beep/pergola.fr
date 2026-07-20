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
  const rows = await load();
  const active = rows.filter((r) => !r.unsubscribed_at);
  return (
    <>
      <AdminHeader
        title="Newsletter"
        subtitle="Abonnés au bandeau newsletter du footer."
        actions={<NewsletterExport rows={active} />}
      />

      <AdminSection>
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard label="Abonnés actifs" value={active.length} Icon={Mail} />
          <KpiCard
            label="Désabonnés"
            value={rows.length - active.length}
            hint="Ne recevront plus de campagnes"
          />
          <KpiCard
            label="Locale FR"
            value={active.filter((r) => r.locale === "fr").length}
          />
        </div>
      </AdminSection>

      <AdminSection>
        <div className="bg-background border-border/60 overflow-hidden rounded-3xl border">
          <table className="w-full text-sm">
            <thead className="border-border/60 border-b text-left">
              <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                <th>Email</th>
                <th>Locale</th>
                <th>Inscrit le</th>
                <th>Statut</th>
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
                    {new Date(s.subscribed_at).toLocaleString("fr-FR", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </td>
                  <td className="px-6 py-4">
                    {s.unsubscribed_at ? (
                      <span className="text-secondary text-xs">Désabonné</span>
                    ) : (
                      <span className="bg-accent/15 text-accent rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                        Actif
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
                    Aucun abonné pour l&apos;instant.
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
