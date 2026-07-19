import { setRequestLocale, getTranslations } from "next-intl/server";
import { ShieldCheck, Wrench, Cpu, Palette, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "warranty" });
  return { title: t("title"), description: t("intro") };
}

const guarantees = [
  { key: "structure", Icon: Wrench },
  { key: "motors", Icon: Cpu },
  { key: "finish", Icon: Palette },
  { key: "accessories", Icon: ShieldCheck },
] as const;

export default async function GarantiePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("warranty");
  const included = t.raw("coveredList") as string[];
  const notCovered = t.raw("excludedList") as string[];

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />

      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {guarantees.map(({ key, Icon }) => (
              <div
                key={key}
                className="border-border/70 rounded-[var(--radius-lg)] border p-8"
              >
                <div className="text-accent">
                  <Icon className="size-6" />
                </div>
                <div className="text-accent mt-6 text-[10px] font-medium uppercase tracking-[0.25em]">
                  {t("guaranteeLabel")}
                </div>
                <div className="mt-1 font-serif text-4xl">
                  {t(`${key}.years`)}
                </div>
                <h3 className="mt-4 font-serif text-lg">{t(`${key}.title`)}</h3>
                <p className="text-secondary mt-2 text-sm">
                  {t(`${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-muted py-24 md:py-32">
        <Container>
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <Eyebrow>{t("coveredEyebrow")}</Eyebrow>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                {t("coveredTitle")}
              </h2>
              <ul className="mt-8 space-y-4">
                {included.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm">
                    <span className="bg-accent/15 text-accent mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-3.5" />
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Eyebrow>{t("excludedEyebrow")}</Eyebrow>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                {t("excludedTitle")}
              </h2>
              <ul className="text-secondary mt-8 space-y-4 text-sm">
                {notCovered.map((s) => (
                  <li
                    key={s}
                    className="border-border/60 border-b pb-4 last:border-none"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
