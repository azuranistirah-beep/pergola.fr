import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata = {
  title: "Journal — Inspirations et savoir-faire",
  description:
    "Reportages, conseils et inspirations pour votre projet de pergola, gazebo ou structure d'extérieur.",
};

const posts = [
  {
    slug: "choisir-pergola-bioclimatique",
    title: "Choisir sa pergola bioclimatique : le guide complet 2026",
    excerpt:
      "Motorisation, lames orientables, capteurs pluie-vent : tout ce qu'il faut savoir avant de commander.",
    category: "Guide",
    readingMinutes: 8,
    date: "2026-03-12",
    gradient: "linear-gradient(140deg, #14100b, #c8a46b)",
  },
  {
    slug: "cedre-vs-aluminium",
    title: "Cèdre massif ou aluminium : quel matériau pour votre projet ?",
    excerpt:
      "Deux univers, deux esthétiques, deux entretiens. Nos artisans comparent en détail.",
    category: "Matériaux",
    readingMinutes: 6,
    date: "2026-02-28",
    gradient: "linear-gradient(150deg, #3b2a1a, #a17a4b)",
  },
  {
    slug: "installation-hiver",
    title: "Installer sa pergola en hiver : bonne ou mauvaise idée ?",
    excerpt:
      "Nos chefs de chantier lèvent le voile sur les avantages et les précautions à prendre.",
    category: "Pratique",
    readingMinutes: 4,
    date: "2026-02-14",
    gradient: "linear-gradient(160deg, #1e1e1e, #5a5a5a)",
  },
  {
    slug: "eclairage-led-perimetrique",
    title: "L'éclairage LED périmétrique : notre nouvelle signature",
    excerpt:
      "Blanc chaud ou RGBW pilotable, découvrez le module que nous avons développé.",
    category: "Nouveauté",
    readingMinutes: 3,
    date: "2026-01-30",
    gradient: "linear-gradient(150deg, #4d4335, #c8a46b)",
  },
] as const;

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <section className="bg-muted pt-32 pb-16 md:pt-40 md:pb-24">
        <Container>
          <Eyebrow>Journal</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            Nos inspirations et savoir-faire.
          </h1>
        </Container>
      </section>

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {posts.map((p) => (
              <article
                key={p.slug}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)]"
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden"
                  style={{ background: p.gradient }}
                >
                  <div className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                    style={{
                      background:
                        "radial-gradient(60% 60% at 50% 50%, rgba(255,255,255,0.12) 0%, rgba(0,0,0,0) 70%)",
                    }}
                  />
                </div>
                <div className="pt-6">
                  <div className="text-secondary flex items-center gap-3 text-[10px] uppercase tracking-[0.25em]">
                    <span className="text-accent">{p.category}</span>
                    <span>·</span>
                    <time dateTime={p.date}>
                      {new Date(p.date).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "long",
                        year: "numeric",
                      })}
                    </time>
                    <span>·</span>
                    <span>{p.readingMinutes} min</span>
                  </div>
                  <h2 className="mt-4 font-serif text-2xl leading-tight">
                    {p.title}
                  </h2>
                  <p className="text-secondary mt-3 text-sm">{p.excerpt}</p>
                  <div className="text-primary mt-5 inline-flex items-center gap-1 text-sm font-medium">
                    Lire l&apos;article{" "}
                    <ArrowUpRight className="size-4 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
