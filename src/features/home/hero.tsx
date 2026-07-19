import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function Hero() {
  const t = useTranslations("home");
  return (
    <section className="relative flex min-h-[62vh] items-end overflow-hidden pt-24 md:min-h-[68vh]">
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
        className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/60 to-transparent"
      />

      <Container className="relative z-10 pb-14 md:pb-20">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr] md:items-end">
          <div>
            <Eyebrow className="text-accent">{t("heroEyebrow")}</Eyebrow>
            <h1 className="mt-4 font-serif text-[42px] leading-[1.05] text-white md:text-[72px]">
              {t("heroTitle")}
            </h1>
            <p className="mt-5 max-w-xl text-base leading-relaxed text-white/70">
              {t("heroSubtitle")}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Button asChild variant="accent" size="lg">
                <Link href="/configurateur">
                  {t("heroCta")} <ArrowRight />
                </Link>
              </Button>
              <Button
                asChild
                variant="outline"
                size="lg"
                className="border-white/30 bg-transparent text-white hover:border-white hover:bg-white hover:text-primary"
              >
                <Link href="#collection">{t("heroCtaSecondary")}</Link>
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6 border-l border-white/10 pl-8 text-white/70 md:gap-8">
            {[
              { k: "12+", v: t("statYears") },
              { k: "3 500+", v: t("statInstalls") },
              { k: "100%", v: t("statAluminium") },
              { k: "10 ans", v: t("statWarranty") },
            ].map((s) => (
              <div key={s.v}>
                <div className="font-serif text-3xl text-white">{s.k}</div>
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
