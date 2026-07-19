import { useTranslations } from "next-intl";
import { Download, FileText, Layers, Wrench } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

const items = [
  { key: "sheet", Icon: FileText, size: "1,8 Mo" },
  { key: "plan", Icon: Layers, size: "3,2 Mo" },
  { key: "notice", Icon: Wrench, size: "5,4 Mo" },
] as const;

export function ProductDownloads() {
  const t = useTranslations("pdp.downloads");
  return (
    <section className="bg-muted py-24 md:py-32">
      <Container>
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl">
          {t("title")}
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {items.map(({ key, Icon, size }) => (
            <button
              key={key}
              type="button"
              className="border-border/60 group bg-background flex items-start gap-4 rounded-[var(--radius-lg)] border p-6 text-left transition-colors hover:border-primary"
            >
              <div className="border-accent/30 bg-accent/10 text-accent inline-flex size-11 shrink-0 items-center justify-center rounded-full border">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-primary text-sm font-medium">
                  {t(`${key}.title`)}
                </div>
                <div className="text-secondary mt-1 text-xs">
                  {t(`${key}.body`)}
                </div>
                <div className="text-secondary mt-3 text-[10px] uppercase tracking-[0.25em]">
                  {size}
                </div>
              </div>
              <Download className="text-secondary group-hover:text-primary size-4 shrink-0 transition-colors" />
            </button>
          ))}
        </div>
      </Container>
    </section>
  );
}
