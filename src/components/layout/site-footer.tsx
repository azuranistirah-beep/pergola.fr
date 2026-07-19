import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

const columns = [
  {
    title: "Collections",
    links: [
      { label: "Pergolas bioclimatiques", href: "/pergolas" },
      { label: "Gazebos", href: "/gazebos" },
      { label: "Carports", href: "/carports" },
      { label: "Cuisines d'extérieur", href: "/cuisines-exterieur" },
      { label: "Accessoires", href: "/accessoires" },
    ],
  },
  {
    title: "Maison",
    links: [
      { label: "À propos", href: "/a-propos" },
      { label: "Nos réalisations", href: "/realisations" },
      { label: "Journal", href: "/journal" },
      { label: "Showroom", href: "/contact" },
    ],
  },
  {
    title: "Service",
    links: [
      { label: "Configurateur", href: "/configurateur" },
      { label: "Livraison", href: "/livraison" },
      { label: "Garantie", href: "/garantie" },
      { label: "FAQ", href: "/faq" },
      { label: "Contact", href: "/contact" },
    ],
  },
];

export function SiteFooter() {
  const t = useTranslations("footer");
  return (
    <footer className="bg-primary text-primary-foreground mt-32">
      <Container className="py-20">
        <div className="grid gap-16 lg:grid-cols-[1.4fr_2fr_1.2fr]">
          <div className="max-w-sm">
            <div className="font-serif text-3xl tracking-tight">
              Pergola<span className="text-accent">.</span>fr
            </div>
            <p className="text-primary-foreground/60 mt-6 text-sm leading-relaxed">
              {t("tagline")}
            </p>
            <div className="mt-8 flex flex-col gap-2 text-sm">
              <span className="text-primary-foreground/60">
                {t("showroom")}
              </span>
              <span>12 rue de Rivoli, 75004 Paris</span>
              <span className="text-accent mt-1">+33 1 84 88 00 00</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-10 md:grid-cols-3">
            {columns.map((col) => (
              <div key={col.title}>
                <Eyebrow className="text-primary-foreground/50 mb-5">
                  {col.title}
                </Eyebrow>
                <ul className="flex flex-col gap-3">
                  {col.links.map((l) => (
                    <li key={l.href}>
                      <Link
                        href={l.href}
                        className="text-primary-foreground/85 hover:text-accent text-sm transition-colors"
                      >
                        {l.label}
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
            <form className="border-primary-foreground/20 focus-within:border-accent mt-5 flex items-center border-b py-3 transition-colors">
              <input
                type="email"
                placeholder={t("emailPlaceholder")}
                className="placeholder:text-primary-foreground/40 flex-1 bg-transparent text-sm outline-none"
              />
              <button
                type="submit"
                className="text-accent text-xs font-medium uppercase tracking-[0.2em]"
              >
                {t("subscribe")}
              </button>
            </form>
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
