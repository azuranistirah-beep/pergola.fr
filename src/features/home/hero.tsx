import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Hero() {
  const t = useTranslations("home");
  return (
    <section className="relative flex min-h-[100svh] items-end overflow-hidden">
      {/* Layered atmosphere — replaces video for scaffold */}
      <div
        aria-hidden
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 80% at 70% 20%, rgba(200,164,107,0.35) 0%, rgba(17,17,17,0) 50%), linear-gradient(180deg, #14100b 0%, #1c1a17 45%, #0f0d0a 100%)",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06] mix-blend-overlay"
        style={{
          backgroundImage:
            "radial-gradient(#ffffff 1px, transparent 1px), radial-gradient(#ffffff 1px, transparent 1px)",
          backgroundSize: "40px 40px, 40px 40px",
          backgroundPosition: "0 0, 20px 20px",
        }}
      />
      <div
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/70 to-transparent"
      />

      <Container className="relative z-10 pb-24 pt-40 md:pb-32">
        <div className="max-w-3xl">
          <Eyebrow className="text-accent">
            {t("heroEyebrow")}
          </Eyebrow>
          <h1 className="mt-6 font-serif text-[52px] leading-[1.05] text-white md:text-[88px]">
            {t("heroTitle")}
          </h1>
          <p className="mt-8 max-w-xl text-lg leading-relaxed text-white/70">
            {t("heroSubtitle")}
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="accent" size="lg">
              <Link href="/configurateur">
                {t("heroCta")}
                <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-transparent text-white hover:border-white hover:bg-white hover:text-primary"
            >
              <Link href="/realisations">{t("heroCtaSecondary")}</Link>
            </Button>
          </div>
        </div>

        <div className="mt-24 grid grid-cols-2 gap-8 border-t border-white/10 pt-10 text-white/70 md:grid-cols-4">
          {[
            { k: "12+", v: t("statYears") },
            { k: "3 500+", v: t("statInstalls") },
            { k: "100%", v: t("statAluminium") },
            { k: "10 ans", v: t("statWarranty") },
          ].map((s) => (
            <div key={s.v}>
              <div className="font-serif text-3xl text-white md:text-4xl">
                {s.k}
              </div>
              <div className="mt-2 text-xs uppercase tracking-[0.2em] text-white/50">
                {s.v}
              </div>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
