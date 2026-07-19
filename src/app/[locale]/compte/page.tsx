import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  Bookmark,
  Heart,
  LogOut,
  MapPin,
  Package,
  Settings,
  User,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/utils";

const nav = [
  { key: "overview", Icon: User },
  { key: "orders", Icon: Package },
  { key: "quotes", Icon: Bookmark },
  { key: "addresses", Icon: MapPin },
  { key: "wishlist", Icon: Heart },
  { key: "settings", Icon: Settings },
] as const;

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("account");
  const orders = [
    {
      id: "PGL-2026-00184",
      date: "2026-03-08",
      status: t("orderStatusInAtelier"),
      statusTone: "text-accent",
      total: 849000,
      items: 1,
    },
    {
      id: "PGL-2025-00612",
      date: "2025-11-14",
      status: t("orderStatusDelivered"),
      statusTone: "text-primary",
      total: 214000,
      items: 2,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
            <nav className="border-border/60 lg:sticky lg:top-32 lg:self-start lg:border-r lg:pr-6">
              <ul className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
                {nav.map(({ key, Icon }) => (
                  <li key={key}>
                    <button className="hover:bg-muted text-primary flex w-full items-center gap-3 rounded-full px-4 py-2 text-left text-sm whitespace-nowrap transition-colors">
                      <Icon className="text-secondary size-4" />
                      {t(`sidebar.${key}`)}
                    </button>
                  </li>
                ))}
                <li className="mt-4 lg:mt-8">
                  <button className="text-secondary hover:text-primary flex w-full items-center gap-3 px-4 py-2 text-sm whitespace-nowrap">
                    <LogOut className="size-4" /> {t("sidebar.logout")}
                  </button>
                </li>
              </ul>
            </nav>

            <div className="space-y-14">
              <div>
                <h2 className="font-serif text-2xl">{t("ordersTitle")}</h2>
                <div className="border-border/70 mt-6 divide-border/70 divide-y overflow-hidden rounded-[var(--radius-lg)] border">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between gap-4 p-6"
                    >
                      <div>
                        <div className="font-mono text-xs">{o.id}</div>
                        <div className="text-secondary mt-1 text-xs">
                          {new Date(o.date).toLocaleDateString(
                            locale === "en" ? "en-GB" : "fr-FR",
                            { day: "numeric", month: "long", year: "numeric" },
                          )}{" "}
                          · {o.items} article{o.items > 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div
                          className={`text-xs font-medium ${o.statusTone}`}
                        >
                          {o.status}
                        </div>
                        <div className="mt-1 font-serif text-lg">
                          {formatEUR(o.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h2 className="font-serif text-2xl">{t("quickTitle")}</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <QuickAction
                    title={t("quoteCard.title")}
                    body={t("quoteCard.body")}
                    href="/configurateur"
                    label={t("continue")}
                  />
                  <QuickAction
                    title={t("savedCard.title")}
                    body={t("savedCard.body")}
                    href="/compte"
                    label={t("continue")}
                  />
                </div>
              </div>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}

function QuickAction({
  title,
  body,
  href,
  label,
}: {
  title: string;
  body: string;
  href: string;
  label: string;
}) {
  return (
    <div className="border-border/70 rounded-[var(--radius-lg)] border p-6">
      <h3 className="font-serif text-lg">{title}</h3>
      <p className="text-secondary mt-2 text-sm">{body}</p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href={href}>{label}</Link>
      </Button>
    </div>
  );
}
