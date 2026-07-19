import { setRequestLocale, getTranslations } from "next-intl/server";
import { Truck, MapPin, Package, Clock, Wrench, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "shipping" });
  return { title: t("title"), description: t("intro") };
}

const steps = [
  { key: "step1", Icon: Package },
  { key: "step2", Icon: Truck },
  { key: "step3", Icon: Wrench },
  { key: "step4", Icon: ShieldCheck },
] as const;

const shippingOptions = ["standard", "express", "install", "beNlCh"] as const;

export default async function LivraisonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("shipping");

  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />

      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ key, Icon }) => (
              <div key={key}>
                <div className="border-accent/40 bg-accent/10 text-accent inline-flex size-14 items-center justify-center rounded-full border">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-6 font-serif text-xl">
                  {t(`${key}.title`)}
                </h3>
                <p className="text-secondary mt-3 text-sm leading-relaxed">
                  {t(`${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-muted py-24 md:py-32">
        <Container>
          <Eyebrow>{t("optionsEyebrow")}</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
            {t("optionsTitle")}
          </h2>

          <div className="border-border/70 mt-12 overflow-hidden rounded-[var(--radius-lg)] border bg-background">
            {shippingOptions.map((opt, i) => (
              <div
                key={opt}
                className={`grid grid-cols-1 gap-2 p-6 md:grid-cols-[2fr_1fr_1fr] md:items-center md:gap-6 md:p-8 ${i > 0 ? "border-border border-t" : ""}`}
              >
                <div className="text-primary text-sm font-medium">
                  {t(`${opt}.label`)}
                </div>
                <div className="text-secondary flex items-center gap-2 text-sm">
                  <Clock className="text-accent size-3.5" />
                  {t(`${opt}.delay`)}
                </div>
                <div className="text-primary text-sm font-medium md:text-right">
                  {t(`${opt}.price`)}
                </div>
              </div>
            ))}
          </div>

          <div className="text-secondary mt-8 flex items-start gap-3 text-sm">
            <MapPin className="text-accent mt-0.5 size-4 shrink-0" />
            <p>{t("outsideNotice")}</p>
          </div>
        </Container>
      </section>
    </>
  );
}
