import { setRequestLocale } from "next-intl/server";
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

export const metadata = {
  title: "Mon compte",
  description: "Suivez vos commandes, adresses, devis et wishlist Pergola FR.",
};

const nav = [
  { key: "overview", label: "Aperçu", Icon: User },
  { key: "orders", label: "Commandes", Icon: Package },
  { key: "quotes", label: "Devis", Icon: Bookmark },
  { key: "addresses", label: "Adresses", Icon: MapPin },
  { key: "wishlist", label: "Wishlist", Icon: Heart },
  { key: "settings", label: "Paramètres", Icon: Settings },
];

const orders = [
  {
    id: "PGL-2026-00184",
    date: "2026-03-08",
    status: "En atelier",
    statusTone: "text-accent",
    total: 849000,
    items: 1,
  },
  {
    id: "PGL-2025-00612",
    date: "2025-11-14",
    status: "Livré",
    statusTone: "text-primary",
    total: 214000,
    items: 2,
  },
];

export default async function AccountPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PageHeader
        eyebrow="Espace client"
        title="Bonjour, Camille."
        intro="Suivez vos commandes en cours, retrouvez vos devis sauvegardés et gérez votre compte."
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[240px_1fr]">
            {/* Sidebar */}
            <nav className="border-border/60 lg:sticky lg:top-32 lg:self-start lg:border-r lg:pr-6">
              <ul className="flex flex-row gap-2 overflow-x-auto lg:flex-col lg:gap-1">
                {nav.map(({ key, label, Icon }) => (
                  <li key={key}>
                    <button className="hover:bg-muted text-primary flex w-full items-center gap-3 rounded-full px-4 py-2 text-left text-sm transition-colors whitespace-nowrap">
                      <Icon className="text-secondary size-4" />
                      {label}
                    </button>
                  </li>
                ))}
                <li className="mt-4 lg:mt-8">
                  <button className="text-secondary hover:text-primary flex w-full items-center gap-3 px-4 py-2 text-sm whitespace-nowrap">
                    <LogOut className="size-4" /> Déconnexion
                  </button>
                </li>
              </ul>
            </nav>

            {/* Content */}
            <div className="space-y-14">
              <div>
                <h2 className="font-serif text-2xl">Commandes récentes</h2>
                <div className="border-border/70 mt-6 divide-border/70 divide-y overflow-hidden rounded-[var(--radius-lg)] border">
                  {orders.map((o) => (
                    <div
                      key={o.id}
                      className="flex items-center justify-between gap-4 p-6"
                    >
                      <div>
                        <div className="font-mono text-xs">{o.id}</div>
                        <div className="text-secondary mt-1 text-xs">
                          {new Date(o.date).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}{" "}
                          · {o.items} article{o.items > 1 ? "s" : ""}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className={`text-xs font-medium ${o.statusTone}`}>
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
                <h2 className="font-serif text-2xl">Actions rapides</h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  <QuickAction
                    title="Ouvrir un nouveau devis"
                    body="Composez votre pergola et recevez un chiffrage sous 48h."
                    href="/configurateur"
                  />
                  <QuickAction
                    title="Voir mes configurations"
                    body="Retrouvez toutes les compositions que vous avez sauvegardées."
                    href="/compte"
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
}: {
  title: string;
  body: string;
  href: string;
}) {
  return (
    <div className="border-border/70 rounded-[var(--radius-lg)] border p-6">
      <h3 className="font-serif text-lg">{title}</h3>
      <p className="text-secondary mt-2 text-sm">{body}</p>
      <Button asChild variant="outline" size="sm" className="mt-4">
        <Link href={href}>Continuer</Link>
      </Button>
    </div>
  );
}
