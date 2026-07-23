import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { NewsletterForm } from "@/features/newsletter/newsletter-form";
import { getSiteInfo } from "@/repositories/settings-repository";
import { Logo } from "@/components/brand/logo";

const columns = [
  {
    title: "collection",
    links: [
      { key: "pergolas", href: "/pergolas" },
      { key: "gazebos", href: "/gazebos" },
      { key: "carports", href: "/carports" },
      { key: "kitchens", href: "/cuisines-exterieur" },
      { key: "accessories", href: "/accessoires" },
    ],
  },
  {
    title: "house",
    links: [
      { key: "about", href: "/a-propos" },
      { key: "projects", href: "/realisations" },
      { key: "journal", href: "/journal" },
      { key: "showroom", href: "/contact" },
    ],
  },
  {
    title: "service",
    links: [
      { key: "configurator", href: "/configurateur" },
      { key: "shipping", href: "/livraison" },
      { key: "warranty", href: "/garantie" },
      { key: "faq", href: "/faq" },
      { key: "contact", href: "/contact" },
    ],
  },
] as const;

export async function SiteFooter() {
  const [t, site] = await Promise.all([
    getTranslations("footer"),
    getSiteInfo(),
  ]);
  return (
    <footer className="bg-primary text-primary-foreground mt-32">
      <Container className="py-20">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_2fr_1.2fr]">
          <div className="max-w-sm">
            <Logo
              variant="stacked"
              showTagline
              wordClassName="text-3xl"
              className="items-start text-primary-foreground"
            />
            <p className="text-primary-foreground/60 mt-6 text-sm leading-relaxed">
              {t("tagline")}
            </p>
            <div className="mt-8 flex flex-col gap-2 text-sm">
              <span className="text-primary-foreground/60">
                {t("showroom")}
              </span>
              <span>{site.showroomAddress}</span>
              <a
                className="text-accent mt-1 hover:underline"
                href={`tel:${site.phone.replace(/\s+/g, "")}`}
              >
                {site.phone}
              </a>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <Eyebrow className="text-primary-foreground/50 mb-5">
                  {t(`columns.${col.title}`)}
                </Eyebrow>
                <ul className="flex flex-col gap-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-primary-foreground/85 hover:text-accent text-sm transition-colors"
                      >
                        {t(`columns.${col.title}Links.${l.key}`)}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <Eyebrow className="text-primary-foreground/50 mb-5">
              {t("newsletter")}
            </Eyebrow>
            <p className="text-primary-foreground/70 text-sm">
              {t("newsletterCopy")}
            </p>
            <NewsletterForm
              placeholder={t("emailPlaceholder")}
              submitLabel={t("subscribe")}
            />
          </div>
        </div>

        <div className="border-primary-foreground/10 mt-20 flex flex-col justify-between gap-4 border-t pt-8 text-xs md:flex-row">
          <span className="text-primary-foreground/50">
            © {new Date().getFullYear()} Pergola FR — {t("rights")}
          </span>
          <div className="flex gap-6">
            <Link
              href="/mentions-legales"
              className="text-primary-foreground/50 hover:text-primary-foreground"
            >
              {t("legal")}
            </Link>
            <Link
              href="/confidentialite"
              className="text-primary-foreground/50 hover:text-primary-foreground"
            >
              {t("privacy")}
            </Link>
            <Link
              href="/cgv"
              className="text-primary-foreground/50 hover:text-primary-foreground"
            >
              {t("terms")}
            </Link>
          </div>
        </div>
      </Container>
    </footer>
  );
}
