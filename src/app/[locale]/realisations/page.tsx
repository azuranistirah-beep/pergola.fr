import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { projects } from "@/features/projects/projects-data";

export const metadata = {
  title: "Réalisations — Nos projets sur-mesure",
  description:
    "Explorez les projets pergolas réalisés dans toute la France : maisons individuelles, hôtels, restaurants, bords de piscine.",
};

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PageHeader
        eyebrow="Réalisations"
        title="Portfolio de nos projets sur-mesure."
        intro="Résidences, hôtels, restaurants, bords de piscine — chaque projet est unique, dessiné avec un chef de studio dédié."
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid auto-rows-[300px] grid-cols-1 gap-4 md:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.slug}
                href={`/realisations/${p.slug}`}
                className={`group relative overflow-hidden rounded-[var(--radius-lg)] ${p.span ?? ""}`}
                style={{ background: p.gradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-8 text-white">
                  <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] backdrop-blur">
                    {p.tag}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl leading-tight md:text-3xl">
                      {p.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-4 text-xs text-white/70">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" /> {p.location}
                      </span>
                      <span>{p.year}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-white/85">
                      <span>Découvrir le projet</span>
                      <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
