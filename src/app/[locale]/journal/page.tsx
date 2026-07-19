import { setRequestLocale, getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { journalPosts } from "@/features/journal/journal-data";
import { journalPhoto } from "@/lib/imagery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "journalPage" });
  return { title: t("title"), description: t("intro") };
}

export default async function BlogPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("journalPage");
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
          <div className="grid gap-8 md:grid-cols-2">
            {journalPosts.map((p) => (
              <Link
                key={p.slug}
                href={`/journal/${p.slug}`}
                className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)]"
              >
                <div className="relative aspect-[16/10] overflow-hidden bg-muted">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={journalPhoto[p.slug]}
                    alt={en ? p.title_en : p.title}
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/50 to-transparent"
                  />
                </div>
                <div className="pt-6">
                  <div className="text-secondary flex items-center gap-3 text-[10px] uppercase tracking-[0.25em]">
                    <span className="text-accent">
                      {en ? p.category_en : p.category}
                    </span>
                    <span>·</span>
                    <time dateTime={p.date}>
                      {new Date(p.date).toLocaleDateString(
                        en ? "en-GB" : "fr-FR",
                        { day: "numeric", month: "long", year: "numeric" },
                      )}
                    </time>
                    <span>·</span>
                    <span>
                      {p.readingMinutes} {t("minutes")}
                    </span>
                  </div>
                  <h2 className="mt-4 font-serif text-2xl leading-tight">
                    {en ? p.title_en : p.title}
                  </h2>
                  <p className="text-secondary mt-3 text-sm">
                    {en ? p.excerpt_en : p.excerpt}
                  </p>
                  <div className="text-primary mt-5 inline-flex items-center gap-1 text-sm font-medium">
                    {t("readArticle")}{" "}
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
