import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  Calendar,
  Check,
  Download,
  Mail,
  Package,
  Truck,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/utils";

export const metadata = {
  robots: { index: false, follow: false },
};

const steps = [
  { key: "email", Icon: Mail },
  { key: "engineering", Icon: Package },
  { key: "manufacturing", Icon: Calendar },
  { key: "delivery", Icon: Truck },
] as const;

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("confirmation");

  return (
    <div className="relative pt-32 pb-24 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(200,164,107,0.20) 0%, rgba(200,164,107,0) 60%)",
        }}
      />

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="border-accent/50 bg-accent/10 text-accent mx-auto inline-flex size-16 items-center justify-center rounded-full border">
            <Check className="size-7" />
          </div>
          <Eyebrow className="mt-8">{t("badge")}</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
            {t("title")}
          </h1>
          <p className="text-secondary mt-6 text-base">
            {t("intro")}{" "}
            <strong className="text-primary">c.riviere@example.fr</strong>.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="border-border/70 grid gap-6 rounded-[var(--radius-lg)] border p-8 md:grid-cols-3">
            <Summary label={t("orderRef")} value="PGL-2026-00184" mono />
            <Summary label={t("orderTotal")} value={formatEUR(849000)} />
            <Summary label={t("orderPayment")} value="Visa •••• 4242" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button variant="primary" size="lg" className="w-full">
              <Download /> {t("download")}
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/compte">{t("track")}</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-4xl">
          <Eyebrow>{t("nextEyebrow")}</Eyebrow>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            {t("nextTitle")}
          </h2>

          <ol className="border-border/60 mt-10 divide-border/60 divide-y overflow-hidden rounded-[var(--radius-lg)] border">
            {steps.map(({ key, Icon }, i) => (
              <li
                key={key}
                className="grid gap-4 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-8"
              >
                <div className="border-accent/30 bg-accent/10 text-accent inline-flex size-12 items-center justify-center rounded-full border">
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                    {t("step")} {i + 1}
                  </div>
                  <h3 className="mt-1 font-serif text-lg leading-tight">
                    {t(`steps.${key}.title`)}
                  </h3>
                  <p className="text-secondary mt-2 text-sm">
                    {t(`steps.${key}.body`)}
                  </p>
                </div>
                <div className="text-accent text-xs font-medium uppercase tracking-[0.2em] md:text-right">
                  {t(`steps.${key}.time`)}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </div>
  );
}

function Summary({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
        {label}
      </div>
      <div
        className={`mt-2 text-primary text-lg ${mono ? "font-mono" : "font-serif"}`}
      >
        {value}
      </div>
    </div>
  );
}
