import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Award, Factory, Leaf, MapPin } from "lucide-react";
import { editorialPhoto } from "@/lib/imagery";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "about" });
  return { title: t("title"), description: t("intro") };
}

const commitments = [
  { key: "design", Icon: MapPin },
  { key: "workshop", Icon: Factory },
  { key: "ecodesign", Icon: Leaf },
  { key: "awarded", Icon: Award },
] as const;

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("about");
  return (
    <>
      <section className="bg-muted pt-32 pb-16 md:pt-40 md:pb-24">
        <Container>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            {t("title")}
          </h1>
          <p className="text-secondary mt-8 max-w-2xl text-lg leading-relaxed">
            {t("intro")}
          </p>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-16 md:grid-cols-2 md:items-center">
            <div className="aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={editorialPhoto.aboutAtelier}
                alt=""
                className="h-full w-full object-cover"
              />
            </div>
            <div>
              <Eyebrow>{t("atelierEyebrow")}</Eyebrow>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                {t("atelierTitle")}
              </h2>
              <p className="text-secondary mt-6 text-base">{t("atelierBody")}</p>
              <dl className="mt-10 grid grid-cols-2 gap-y-6">
                {[
                  ["3 200 m²", t("statWorkshop")],
                  ["42", t("statCompanions")],
                  ["4", t("statLeadtime")],
                  ["100%", t("statMadeIn")],
                ].map(([k, v]) => (
                  <div key={v}>
                    <dt className="font-serif text-3xl">{k}</dt>
                    <dd className="text-secondary mt-1 text-xs uppercase tracking-[0.2em]">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-primary text-primary-foreground py-24 md:py-32">
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow className="text-accent">{t("commitmentsEyebrow")}</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              {t("commitmentsTitle")}
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {commitments.map(({ key, Icon }) => (
              <div key={key}>
                <div className="border-accent/40 bg-accent/10 text-accent inline-flex size-14 items-center justify-center rounded-full border">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-6 font-serif text-xl">{t(`${key}.title`)}</h3>
                <p className="text-primary-foreground/70 mt-3 text-sm">
                  {t(`${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
