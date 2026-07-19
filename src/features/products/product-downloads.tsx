import { Download, FileText, Layers, Wrench } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

const items = [
  {
    Icon: FileText,
    title: "Fiche produit PDF",
    body: "Dimensions, matériaux, coloris, tarifs — 4 pages.",
    size: "1,8 Mo",
  },
  {
    Icon: Layers,
    title: "Plan technique DWG / PDF",
    body: "Vues de face, dessus, côtés et détails de fixation.",
    size: "3,2 Mo",
  },
  {
    Icon: Wrench,
    title: "Notice de pose illustrée",
    body: "Guide pas-à-pas avec accès vidéo YouTube.",
    size: "5,4 Mo",
  },
];

export function ProductDownloads() {
  return (
    <section className="bg-muted py-24 md:py-32">
      <Container>
        <Eyebrow>Documents à télécharger</Eyebrow>
        <h2 className="mt-4 font-serif text-3xl leading-tight md:text-5xl">
          Tout ce dont vous avez besoin.
        </h2>

        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {items.map(({ Icon, title, body, size }) => (
            <button
              key={title}
              type="button"
              className="border-border/60 group bg-background flex items-start gap-4 rounded-[var(--radius-lg)] border p-6 text-left transition-colors hover:border-primary"
            >
              <div className="border-accent/30 bg-accent/10 text-accent inline-flex size-11 shrink-0 items-center justify-center rounded-full border">
                <Icon className="size-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-primary text-sm font-medium">{title}</div>
                <div className="text-secondary mt-1 text-xs">{body}</div>
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
