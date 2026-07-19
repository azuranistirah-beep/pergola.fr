import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

const items = ["t1", "t2", "t3"] as const;

// Distinct warm gradients so each avatar reads as a different person.
const avatarStyles: Record<string, string> = {
  t1: "linear-gradient(140deg, #a17a4b 0%, #5c3e1d 100%)",
  t2: "linear-gradient(140deg, #2b2b2b 0%, #6a6a6a 100%)",
  t3: "linear-gradient(140deg, #c8a46b 0%, #7d5a2b 100%)",
};

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter((w) => w && !w.includes("."))
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

export function Testimonials() {
  const t = useTranslations("home.testimonials");
  return (
    <section className="py-24 md:py-32">
      <Container>
        <div className="mb-16 text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            {t("title")}
          </h2>
        </div>
        <div className="grid gap-6 md:grid-cols-3">
          {items.map((k) => {
            const name = t(`${k}.name`);
            return (
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
                  <div
                    className="flex size-11 items-center justify-center rounded-full font-serif text-sm text-white"
                    style={{ background: avatarStyles[k] }}
                    aria-hidden
                  >
                    {initials(name)}
                  </div>
                  <div>
                    <div className="text-sm font-medium">{name}</div>
                    <div className="text-secondary text-xs">
                      {t(`${k}.location`)}
                    </div>
                  </div>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
