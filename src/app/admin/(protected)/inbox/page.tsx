import { Mail } from "lucide-react";
import {
  AdminCard,
  AdminHeader,
  AdminSection,
  KpiCard,
} from "@/features/admin/admin-ui";
import { ContactActionsBar } from "@/features/admin/contact-actions-bar";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { getT, type AdminMessageKey } from "@/lib/admin-i18n";

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  postal: string | null;
  message: string;
  status: "NEW" | "READ" | "REPLIED" | "ARCHIVED";
  locale: string;
  created_at: string;
}

const statusTone: Record<string, string> = {
  NEW: "bg-accent text-accent-foreground",
  READ: "bg-muted text-secondary",
  REPLIED: "bg-primary/10 text-primary",
  ARCHIVED: "bg-muted text-secondary",
};

async function load() {
  const { data } = await insforgeAdmin.database
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  return (data ?? []) as Message[];
}

export default async function InboxPage() {
  const [messages, { t, locale }] = await Promise.all([load(), getT()]);
  const newCount = messages.filter((m) => m.status === "NEW").length;
  const repliedCount = messages.filter((m) => m.status === "REPLIED").length;
  const dateLocale = locale === "id" ? "id-ID" : "en-GB";

  return (
    <>
      <AdminHeader title={t("inbox.title")} subtitle={t("inbox.subtitle")} />

      <AdminSection>
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard label={t("common.total")} value={messages.length} Icon={Mail} />
          <KpiCard
            label={t("inbox.kpi.new")}
            value={newCount}
            hint={t("inbox.kpi.newHint")}
          />
          <KpiCard label={t("inbox.kpi.replied")} value={repliedCount} />
        </div>
      </AdminSection>

      <AdminSection>
        {messages.length === 0 ? (
          <AdminCard className="py-16 text-center">
            <Mail className="text-secondary mx-auto size-8" />
            <p className="text-secondary mt-4 text-sm">
              {t("inbox.emptyTitle")}{" "}
              <code className="bg-muted rounded px-1.5 py-0.5">/contact</code>.
            </p>
          </AdminCard>
        ) : (
          <div className="space-y-4">
            {messages.map((m) => {
              const statusKey = `inbox.status.${m.status}` as AdminMessageKey;
              return (
                <AdminCard key={m.id}>
                  <div className="flex flex-wrap items-start justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <div className="text-primary font-serif text-lg">
                          {m.name}
                        </div>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em] ${statusTone[m.status]}`}
                        >
                          {t(statusKey)}
                        </span>
                        <span className="text-secondary text-[10px] uppercase tracking-[0.2em]">
                          {m.locale.toUpperCase()}
                        </span>
                      </div>
                      <div className="text-secondary mt-1 text-xs">
                        <a href={`mailto:${m.email}`} className="hover:text-primary">
                          {m.email}
                        </a>
                        {m.phone && ` · ${m.phone}`}
                        {m.postal && ` · CP ${m.postal}`}
                        {" · "}
                        <time>
                          {new Date(m.created_at).toLocaleString(dateLocale, {
                            dateStyle: "medium",
                            timeStyle: "short",
                          })}
                        </time>
                      </div>
                    </div>
                    <ContactActionsBar id={m.id} current={m.status} />
                  </div>
                  <p className="text-primary bg-muted mt-4 whitespace-pre-wrap rounded-2xl p-4 text-sm leading-relaxed">
                    {m.message}
                  </p>
                </AdminCard>
              );
            })}
          </div>
        )}
      </AdminSection>
    </>
  );
}
