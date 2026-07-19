import { setRequestLocale } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { journalPosts } from "@/features/journal/journal-data";

export const metadata = {
  title: "Journal — Inspirations et savoir-faire",
  description:
    "Reportages, conseils et inspirations pour votre projet de pergola, gazebo ou structure d'extérieur.",
};

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <PageHeader
        eyebrow="Journal"
        title="Nos inspirations et savoir-faire."
        intro="Guides matériaux, retours de chantier, nouveautés atelier — la pensée derrière chaque projet."
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="grid gap-8 md:grid-cols-2">
            {journalPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/journal/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)]"
              >
                <div
                  className="relative aspect-[16/10] overflow-hidden"
                  style={{ background: p.gradient }}
                >
                  <div
                    aria-hidden
                    className="absolute inset-0 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
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
              </Link>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
