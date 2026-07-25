import { useTranslations, useLocale } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { editorialPhoto } from "@/lib/imagery";
import type { ContentSettings } from "@/repositories/settings-repository";

export function Hero({ content }: { content: ContentSettings }) {
  const t = useTranslations("home");
  const locale = useLocale();
  const en = locale === "en";
  const eyebrow = en ? content.heroEyebrowEn : content.heroEyebrowFr;
  const title = en ? content.heroTitleEn : content.heroTitleFr;
  const subtitle = en ? content.heroSubtitleEn : content.heroSubtitleFr;

  return (
    <section className="relative flex min-h-[72vh] items-end overflow-hidden pt-24 md:min-h-[80vh]">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={editorialPhoto.homeHero}
        alt=""
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(20,16,11,0.55) 0%, rgba(20,16,11,0.25) 40%, rgba(20,16,11,0.85) 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 mix-blend-multiply"
        style={{
          background:
            "radial-gradient(70% 60% at 80% 30%, rgba(200,164,107,0.28) 0%, rgba(0,0,0,0) 55%)",
        }}
      />

      <Container className="relative z-10 pb-16 md:pb-24">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <Eyebrow className="text-accent">{eyebrow}</Eyebrow>
            <h1 className="mt-4 font-serif text-[44px] leading-[1.02] text-white md:text-[80px]">
              {title}
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/80 md:text-lg">
              {subtitle}
            </p>
            <div className="mt-10 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent" size="lg">
                <Link href="/configurateur">
                  {t("heroCta")} <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/40 bg-white/10 text-white backdrop-blur hover:border-white hover:bg-white hover:text-primary"
              >
                <Link href="#collection">{t("heroCtaSecondary")}</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-t border-white/15 pt-8 text-white/70 md:gap-8 md:border-t-0 md:border-l md:pl-8 md:pt-0">
            {[
              { k: "12+", v: t("statYears") },
              { k: "3 500+", v: t("statInstalls") },
              { k: "100%", v: t("statAluminium") },
              { k: "10 ans", v: t("statWarranty") },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-serif text-2xl text-white md:text-3xl">
                  {s.k}
                </div>
                <div className="mt-1 text-[10px] uppercase tracking-[0.2em] text-white/50">
                  {s.v}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
