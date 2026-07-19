import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowLeft, Clock } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { journalPosts, getPostBySlug } from "@/features/journal/journal-data";
import { journalPhoto } from "@/lib/imagery";

export function generateStaticParams() {
  return journalPosts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return {};
  const en = locale === "en";
  return {
    title: en ? post.title_en : post.title,
    description: en ? post.excerpt_en : post.excerpt,
  };
}

export default async function JournalArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const post = getPostBySlug(slug);
  if (!post) notFound();
  const t = await getTranslations("journalPage");
  const en = locale === "en";
  const related = journalPosts.filter((p) => p.slug !== post.slug).slice(0, 3);

  return (
    <>
      <section className="relative pt-32 pb-20 md:pt-40 md:pb-28">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={journalPhoto[post.slug]}
          alt=""
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
        <Container className="relative text-white">
          <Link
            href="/journal"
            className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-white/70 hover:text-white"
          >
            <ArrowLeft className="size-3" /> {t("backToJournal")}
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3 text-[10px] uppercase tracking-[0.25em] text-white/70">
            <span className="text-accent">
              {en ? post.category_en : post.category}
            </span>
            <span>·</span>
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString(
                en ? "en-GB" : "fr-FR",
                { day: "numeric", month: "long", year: "numeric" },
              )}
            </time>
            <span>·</span>
            <span className="inline-flex items-center gap-1.5">
              <Clock className="size-3" />
              {post.readingMinutes} {t("minutesReading")}
            </span>
          </div>
          <h1 className="mt-6 max-w-4xl font-serif text-4xl leading-[1.1] md:text-6xl">
            {en ? post.title_en : post.title}
          </h1>
          <div className="mt-12 flex items-center gap-3 border-t border-white/20 pt-6">
            <div className="from-accent/40 to-accent/70 size-11 rounded-full bg-gradient-to-br" />
            <div>
              <div className="text-sm font-medium text-white">
                {post.author.name}
              </div>
              <div className="text-xs text-white/60">
                {en ? post.author.role_en : post.author.role}
              </div>
            </div>
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container className="max-w-3xl">
          <p className="text-primary font-serif text-2xl leading-[1.35] md:text-3xl">
            {en ? post.intro_en : post.intro}
          </p>

          <div className="mt-16 space-y-14">
            {post.sections.map((s) => (
              <div key={s.title}>
                <h2 className="font-serif text-3xl leading-tight">
                  {en ? s.title_en : s.title}
                </h2>
                <p className="text-secondary mt-5 text-[15px] leading-[1.75]">
                  {en ? s.body_en : s.body}
                </p>
              </div>
            ))}
          </div>

          <div className="border-border/60 mt-20 flex flex-col items-start gap-4 border-t pt-10 md:flex-row md:items-center md:justify-between">
            <div>
              <Eyebrow>{t("readyEyebrow")}</Eyebrow>
              <p className="text-primary mt-2 font-serif text-2xl">
                {t("readyTitle")}
              </p>
            </div>
            <Button asChild variant="primary" size="lg">
              <Link href="/configurateur">{t("readyCta")}</Link>
            </Button>
          </div>
        </Container>
      </section>

      {related.length > 0 && (
        <section className="bg-muted py-24 md:py-32">
          <Container>
            <Eyebrow>{t("relatedEyebrow")}</Eyebrow>
            <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
              {t("relatedTitle")}
            </h2>

            <div className="mt-12 grid gap-8 md:grid-cols-3">
              {related.map((p) => (
                <Link
                  key={p.slug}
                  href={`/journal/${p.slug}`}
                  className="group"
                >
                  <div className="aspect-[16/10] overflow-hidden rounded-[var(--radius-lg)] bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={journalPhoto[p.slug]}
                      alt=""
                      className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                  </div>
                  <div className="pt-5">
                    <div className="text-accent text-[10px] uppercase tracking-[0.25em]">
                      {en ? p.category_en : p.category}
                    </div>
                    <h3 className="mt-2 font-serif text-lg leading-tight">
                      {en ? p.title_en : p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
