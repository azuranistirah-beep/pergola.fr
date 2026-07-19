import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, ArrowRight, Calendar, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import {
  getProjectBySlug,
  projects,
} from "@/features/projects/projects-data";
import { projectPhoto } from "@/lib/imagery";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  const en = locale === "en";
  return {
    title: en ? project.title_en : project.title,
    description: en ? project.hero_en : project.hero,
  };
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const project = getProjectBySlug(slug);
  if (!project) notFound();
  const t = await getTranslations("projectsPage");
  const en = locale === "en";
  const related = projects.filter((p) => p.slug !== project.slug).slice(0, 3);
  const materials = en ? project.materials_en : project.materials;

  return (
    <>
      <section className="relative pt-32 pb-24 md:pt-40 md:pb-32">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={projectPhoto[project.slug]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/25 to-black/70" />
        <Container className="relative text-white">
          <Link
            href="/realisations"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-white"
          >
            <ArrowLeft className="size-3" /> {t("back")}
          </Link>
          <div className="mt-8">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] backdrop-blur">
              {en ? project.tag_en : project.tag}
            </span>
          </div>
          <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[1.05] md:text-7xl">
            {en ? project.title_en : project.title}
          </h1>
          <div className="mt-8 flex items-center gap-6 text-sm text-white/70">
            <span className="inline-flex items-center gap-2">
              <MapPin className="text-accent size-4" /> {project.location}
            </span>
            <span className="inline-flex items-center gap-2">
              <Calendar className="text-accent size-4" /> {project.year}
            </span>
          </div>
        </Container>
      </section>

      <section className="border-border/60 border-b py-16">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {project.numbers.map(([k, fr, enLabel]) => (
              <div key={k}>
                <div className="font-serif text-4xl md:text-5xl">{k}</div>
                <div className="text-secondary mt-2 text-xs uppercase tracking-[0.2em]">
                  {en ? enLabel : fr}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Eyebrow>{t("detailProjectEyebrow")}</Eyebrow>
          <p className="text-primary mt-6 font-serif text-2xl leading-[1.35] md:text-3xl">
            {en ? project.hero_en : project.hero}
          </p>

          <div className="mt-16 grid gap-14 md:grid-cols-2">
            <div>
              <div className="text-accent text-[10px] uppercase tracking-[0.25em]">
                {t("challenge")}
              </div>
              <p className="text-secondary mt-3 text-[15px] leading-[1.75]">
                {en ? project.challenge_en : project.challenge}
              </p>
            </div>
            <div>
              <div className="text-accent text-[10px] uppercase tracking-[0.25em]">
                {t("solution")}
              </div>
              <p className="text-secondary mt-3 text-[15px] leading-[1.75]">
                {en ? project.solution_en : project.solution}
              </p>
            </div>
          </div>

          <div className="mt-16">
            <div className="text-accent text-[10px] uppercase tracking-[0.25em]">
              {t("materials")}
            </div>
            <ul className="border-border/60 mt-4 divide-border/60 divide-y border-t border-b">
              {materials.map((m) => (
                <li key={m} className="text-primary py-4 text-sm">
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      <section className="bg-primary text-primary-foreground py-24 md:py-32">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <Eyebrow className="text-accent">{t("ctaEyebrow")}</Eyebrow>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl">
                {t("ctaTitle")}
              </h2>
            </div>
            <Button asChild variant="accent" size="lg">
              <Link href="/contact">
                {t("ctaCta")} <ArrowRight />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <Eyebrow>{t("relatedEyebrow")}</Eyebrow>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            {t("relatedTitle")}
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/realisations/${p.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] bg-muted"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={projectPhoto[p.slug]}
                  alt=""
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-6 text-white">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                    {en ? p.tag_en : p.tag}
                  </span>
                  <h3 className="mt-2 font-serif text-lg leading-tight">
                    {en ? p.title_en : p.title}
                  </h3>
                </div>
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
