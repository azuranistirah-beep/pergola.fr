import { useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { editorialPhoto } from "@/lib/imagery";

export function ConfiguratorTeaser() {
  const t = useTranslations("home.configurator");
  const points = ["p1", "p2", "p3", "p4"] as const;
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="bg-primary text-primary-foreground relative overflow-hidden rounded-[var(--radius-lg)]">
          <div
            aria-hidden
            className="absolute -right-24 -top-24 size-[520px] rounded-full"
            style={{
              background:
                "radial-gradient(closest-side, rgba(200,164,107,0.35), rgba(200,164,107,0) 70%)",
            }}
          />
          <div className="relative grid gap-14 p-10 md:grid-cols-2 md:p-16 lg:p-20">
            <div>
              <Eyebrow className="text-accent">{t("eyebrow")}</Eyebrow>
              <h2 className="mt-6 font-serif text-4xl leading-tight md:text-5xl">
                {t("title")}
              </h2>
              <p className="text-primary-foreground/70 mt-6 max-w-md text-base leading-relaxed">
                {t("subtitle")}
              </p>
              <ul className="mt-8 space-y-3">
                {points.map((p) => (
                  <li key={p} className="flex items-start gap-3 text-sm">
                    <span className="bg-accent/20 text-accent mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-3.5" />
                    </span>
                    <span className="text-primary-foreground/85">{t(p)}</span>
                  </li>
                ))}
              </ul>
              <Button asChild variant="accent" size="lg" className="mt-10">
                <Link href="/configurateur">
                  {t("cta")}
                  <ArrowRight />
                </Link>
              </Button>
            </div>

            <div className="relative">
              <div className="bg-primary-foreground/5 border-primary-foreground/10 aspect-[4/5] overflow-hidden rounded-[var(--radius-lg)] border p-8 backdrop-blur">
                <div className="text-primary-foreground/50 flex items-center justify-between text-[10px] uppercase tracking-[0.3em]">
                  <span>{t("previewLabel")}</span>
                  <span className="text-accent">SKU-PGL-4030-BC</span>
                </div>
                <div className="mt-6 aspect-square w-full overflow-hidden rounded-2xl">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={editorialPhoto.configuratorTeaser}
                    alt=""
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="text-primary-foreground/70 mt-6 space-y-3 text-xs">
                  <Row label={t("specWidth")} value="4,00 m" />
                  <Row label={t("specLength")} value="3,00 m" />
                  <Row label={t("specRoof")} value={t("specRoofSample")} />
                  <Row label={t("specColor")} value={t("specColorSample")} />
                  <Row label={t("specLed")} value={t("specLedSample")} />
                </div>
                <div className="border-primary-foreground/10 mt-6 flex items-baseline justify-between border-t pt-5">
                  <span className="text-primary-foreground/50 text-[10px] uppercase tracking-[0.3em]">
                    {t("estimate")}
                  </span>
                  <span className="font-serif text-3xl">8 490 €</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-primary-foreground/50">{label}</span>
      <span className="text-primary-foreground text-right">{value}</span>
    </div>
  );
}
