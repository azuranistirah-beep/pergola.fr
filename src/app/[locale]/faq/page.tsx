import { setRequestLocale, getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FaqAccordion } from "@/features/faq/faq-accordion";
import { faqGroups } from "@/features/faq/faq-data";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "faq" });
  return { title: t("title"), description: t("intro") };
}

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("faq");
  const en = locale === "en";

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />

      <section className="py-24 md:py-32">
        <Container className="max-w-4xl">
          <div className="space-y-16">
            {faqGroups.map((g) => {
              const items = g.items.map((i) => ({
                q: en ? i.q_en : i.q,
                a: en ? i.a_en : i.a,
              }));
              return (
                <div key={g.key}>
                  <Eyebrow>{t(`groups.${g.key}`)}</Eyebrow>
                  <h2 className="mt-4 mb-8 font-serif text-3xl leading-tight md:text-4xl">
                    {t(`groups.${g.key}`)}
                  </h2>
                  <FaqAccordion items={items} />
                </div>
              );
            })}
          </div>
        </Container>
      </section>
    </>
  );
}
