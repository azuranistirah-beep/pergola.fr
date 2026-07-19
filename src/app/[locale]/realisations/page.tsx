import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { projects } from "@/features/projects/projects-data";
import { projectPhoto } from "@/lib/imagery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "projectsPage" });
  return { title: t("title"), description: t("intro") };
}

export default async function ProjectsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("projectsPage");
  const en = locale === "en";
  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />
      <section className="py-16 md:py-24">
        <Container>
          <div className="grid auto-rows-[300px] grid-cols-1 gap-4 md:grid-cols-3">
            {projects.map((p) => (
              <Link
                key={p.slug}
                href={`/realisations/${p.slug}`}
                className={`group relative overflow-hidden rounded-[var(--radius-lg)] bg-muted ${p.span ?? ""}`}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={projectPhoto[p.slug]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/25 to-transparent" />
                <div className="relative flex h-full flex-col justify-between p-8 text-white">
                  <span className="w-fit rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] backdrop-blur">
                    {en ? p.tag_en : p.tag}
                  </span>
                  <div>
                    <h3 className="font-serif text-2xl leading-tight md:text-3xl">
                      {en ? p.title_en : p.title}
                    </h3>
                    <div className="mt-3 flex items-center gap-4 text-xs text-white/70">
                      <span className="inline-flex items-center gap-1">
                        <MapPin className="size-3" /> {p.location}
                      </span>
                      <span>{p.year}</span>
                    </div>
                    <div className="mt-4 flex items-center gap-1 text-xs text-white/85">
                      <span>{t("discover")}</span>
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
