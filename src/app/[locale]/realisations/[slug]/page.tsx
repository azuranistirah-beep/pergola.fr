import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { ArrowLeft, ArrowRight, Calendar, MapPin } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import {
  getProjectBySlug,
  projects,
} from "@/features/projects/projects-data";

export function generateStaticParams() {
  return projects.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const project = getProjectBySlug(slug);
  if (!project) return {};
  return { title: project.title, description: project.hero };
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

  const related = projects.filter((p) => p.slug !== project.slug).slice(0, 3);

  return (
    <>
      {/* Hero */}
      <section
        className="relative pt-32 pb-24 md:pt-40 md:pb-32"
        style={{ background: project.gradient }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 to-black/40" />
        <Container className="relative text-white">
          <Link
            href="/realisations"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-white"
          >
            <ArrowLeft className="size-3" /> Retour aux réalisations
          </Link>
          <div className="mt-8">
            <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em] backdrop-blur">
              {project.tag}
            </span>
          </div>
          <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[1.05] md:text-7xl">
            {project.title}
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

      {/* Numbers */}
      <section className="border-border/60 border-b py-16">
        <Container>
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            {project.numbers.map(([k, v]) => (
              <div key={v}>
                <div className="font-serif text-4xl md:text-5xl">{k}</div>
                <div className="text-secondary mt-2 text-xs uppercase tracking-[0.2em]">
                  {v}
                </div>
              </div>
            ))}
          </div>
        </Container>
      </section>

      {/* Story */}
      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <Eyebrow>Le projet</Eyebrow>
          <p className="text-primary mt-6 font-serif text-2xl leading-[1.35] md:text-3xl">
            {project.hero}
          </p>

          <div className="mt-16 grid gap-14 md:grid-cols-2">
            <div>
              <div className="text-accent text-[10px] uppercase tracking-[0.25em]">
                Le défi
              </div>
              <p className="text-secondary mt-3 text-[15px] leading-[1.75]">
                {project.challenge}
              </p>
            </div>
            <div>
              <div className="text-accent text-[10px] uppercase tracking-[0.25em]">
                Notre réponse
              </div>
              <p className="text-secondary mt-3 text-[15px] leading-[1.75]">
                {project.solution}
              </p>
            </div>
          </div>

          <div className="mt-16">
            <div className="text-accent text-[10px] uppercase tracking-[0.25em]">
              Matériaux & options
            </div>
            <ul className="border-border/60 mt-4 divide-border/60 divide-y border-t border-b">
              {project.materials.map((m) => (
                <li
                  key={m}
                  className="text-primary py-4 text-sm"
                >
                  {m}
                </li>
              ))}
            </ul>
          </div>
        </Container>
      </section>

      {/* CTA */}
      <section className="bg-primary text-primary-foreground py-24 md:py-32">
        <Container>
          <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <Eyebrow className="text-accent">Un projet similaire ?</Eyebrow>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl">
                Parlons de votre extérieur.
              </h2>
            </div>
            <Button asChild variant="accent" size="lg">
              <Link href="/contact">
                Demander un devis <ArrowRight />
              </Link>
            </Button>
          </div>
        </Container>
      </section>

      {/* Related */}
      <section className="py-24 md:py-32">
        <Container>
          <Eyebrow>Autres réalisations</Eyebrow>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            À découvrir également
          </h2>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            {related.map((p) => (
              <Link
                key={p.slug}
                href={`/realisations/${p.slug}`}
                className="group relative aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)]"
                style={{ background: p.gradient }}
              >
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                <div className="relative flex h-full flex-col justify-end p-6 text-white">
                  <span className="text-[10px] uppercase tracking-[0.25em] text-white/70">
                    {p.tag}
                  </span>
                  <h3 className="mt-2 font-serif text-lg leading-tight">
                    {p.title}
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
