import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

const items = ["t1", "t2", "t3"] as const;

export function Testimonials() {
  const t = useTranslations("home.testimonials");
  return (
    <section className="bg-muted py-24 md:py-32">
      <Container>
        <div className="mb-16 text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            {t("title")}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((k) => (
            <figure
              key={k}
              className="bg-background border-border/70 rounded-[var(--radius-lg)] border p-8 shadow-[var(--shadow-soft)]"
            >
              <div className="text-accent flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star key={i} className="size-4 fill-current" />
                ))}
              </div>
              <blockquote className="mt-6 font-serif text-xl leading-snug">
                “{t(`${k}.quote`)}”
              </blockquote>
              <figcaption className="mt-6 flex items-center gap-3">
                <div className="from-accent/30 to-accent/60 size-11 rounded-full bg-gradient-to-br" />
                <div>
                  <div className="text-sm font-medium">{t(`${k}.name`)}</div>
                  <div className="text-secondary text-xs">
                    {t(`${k}.location`)}
                  </div>
                </div>
              </figcaption>
            </figure>
          ))}
        </div>
      </Container>
    </section>
  );
}
