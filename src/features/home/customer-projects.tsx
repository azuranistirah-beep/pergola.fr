import { useTranslations, useLocale } from "next-intl";
import { ArrowRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { projects } from "@/features/projects/projects-data";
import { projectPhoto } from "@/lib/imagery";

export function CustomerProjects() {
  const t = useTranslations("home.projects");
  const locale = useLocale();
  const featured = projects.slice(0, 4);
  return (
    <section className="bg-muted py-24 md:py-32">
      <Container>
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
              {t("title")}
            </h2>
            <p className="text-secondary mt-6 max-w-lg text-base">
              {t("subtitle")}
            </p>
          </div>
          <Button asChild variant="primary" size="lg">
            <Link href="/realisations">
              {t("cta")} <ArrowRight />
            </Link>
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          {featured.map((p, i) => (
            <Link
              key={p.slug}
              href={`/realisations/${p.slug}`}
              className={`group relative aspect-[3/4] overflow-hidden rounded-[var(--radius-lg)] bg-background ${i === 0 ? "md:col-span-2 md:row-span-2 md:aspect-auto" : ""}`}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={projectPhoto[p.slug]}
                alt={locale === "en" ? p.title_en : p.title}
                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="relative flex h-full flex-col justify-between p-6 text-white">
                <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] backdrop-blur">
                  {locale === "en" ? p.tag_en : p.tag}
                </span>
                <div>
                  <h3 className="font-serif text-xl leading-tight md:text-2xl">
                    {locale === "en" ? p.title_en : p.title}
                  </h3>
                  <div className="mt-2 flex items-center gap-3 text-xs text-white/75">
                    <span className="inline-flex items-center gap-1">
                      <MapPin className="size-3" /> {p.location}
                    </span>
                    <span>{p.year}</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
