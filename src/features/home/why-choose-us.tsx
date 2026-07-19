import { useTranslations } from "next-intl";
import { Award, Hammer, Leaf, ShieldCheck } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

const items = [
  { key: "craft", Icon: Hammer },
  { key: "warranty", Icon: ShieldCheck },
  { key: "sustainable", Icon: Leaf },
  { key: "awarded", Icon: Award },
] as const;

export function WhyChooseUs() {
  const t = useTranslations("home.why");
  return (
    <section className="bg-muted py-24 md:py-32">
      <Container>
        <div className="mx-auto mb-16 max-w-2xl text-center">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
            {t("title")}
          </h2>
          <p className="text-secondary mt-6 text-base">{t("subtitle")}</p>
        </div>
        <div className="grid grid-cols-1 gap-px overflow-hidden rounded-[var(--radius-lg)] bg-border md:grid-cols-4">
          {items.map(({ key, Icon }) => (
            <div key={key} className="bg-background p-10">
              <div className="border-accent/40 bg-accent/10 text-accent inline-flex size-14 items-center justify-center rounded-full border">
                <Icon className="size-6" />
              </div>
              <h3 className="mt-6 font-serif text-xl">{t(`${key}.title`)}</h3>
              <p className="text-secondary mt-3 text-sm leading-relaxed">
                {t(`${key}.body`)}
              </p>
            </div>
          ))}
        </div>
      </Container>
    </section>
  );
}
