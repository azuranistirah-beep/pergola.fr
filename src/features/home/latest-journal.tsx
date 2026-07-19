import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { journalPosts } from "@/features/journal/journal-data";
import { journalPhoto } from "@/lib/imagery";

export function LatestJournal() {
  const posts = journalPosts.slice(0, 3);
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="mb-14 flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div>
            <Eyebrow>Journal</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
              Dernières inspirations.
            </h2>
          </div>
          <Link
            href="/journal"
            className="text-primary hidden text-sm font-medium underline underline-offset-4 md:inline-block"
          >
            Tous les articles →
          </Link>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {posts.map((p) => (
            <Link
              key={p.slug}
              href={`/journal/${p.slug}`}
              className="group flex flex-col"
            >
              <div className="bg-muted relative aspect-[4/3] overflow-hidden rounded-[var(--radius-lg)]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={journalPhoto[p.slug]}
                  alt={p.title}
                  className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute left-4 top-4 rounded-full bg-background/95 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.25em]">
                  <span className="text-accent">{p.category}</span>
                </div>
              </div>
              <div className="pt-6">
                <div className="text-secondary flex items-center gap-2 text-xs">
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
                <h3 className="mt-3 font-serif text-xl leading-tight">
                  {p.title}
                </h3>
                <p className="text-secondary mt-3 line-clamp-2 text-sm">
                  {p.excerpt}
                </p>
                <div className="text-primary mt-4 inline-flex items-center gap-1 text-sm font-medium">
                  Lire{" "}
                  <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
