import { useTranslations } from "next-intl";
import { ArrowRight, MapPin, Phone } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";

export function CtaShowroom() {
  const t = useTranslations("home.cta");
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center">
          <div className="max-w-2xl">
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              {t("title")}
            </h2>
            <p className="text-secondary mt-6 max-w-lg text-base">
              {t("subtitle")}
            </p>
          </div>
          <div className="flex flex-col gap-4">
            <Button asChild variant="primary" size="lg">
              <Link href="/contact">
                {t("cta")}
                <ArrowRight />
              </Link>
            </Button>
            <div className="text-secondary flex items-center gap-6 text-sm">
              <span className="inline-flex items-center gap-2">
                <MapPin className="text-accent size-4" /> Paris 4ᵉ
              </span>
              <span className="inline-flex items-center gap-2">
                <Phone className="text-accent size-4" /> +33 1 84 88 00 00
              </span>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
