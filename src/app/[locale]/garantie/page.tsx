import { setRequestLocale } from "next-intl/server";
import { ShieldCheck, Wrench, Cpu, Palette, Check } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";

export const metadata = {
  title: "Garantie 10 ans",
  description:
    "Structure, motorisations, finitions — le détail de nos garanties constructeur, en plus des garanties légales.",
};

const guarantees = [
  { Icon: Wrench, years: "10 ans", title: "Structure porteuse", body: "Traverses, chevrons, poteaux, sabots inox. Corrosion, déformation, rupture." },
  { Icon: Cpu, years: "5 ans", title: "Motorisations & LED", body: "Moteurs Somfy, cartes électroniques, bandeaux LED intégrés, capteurs pluie/vent." },
  { Icon: Palette, years: "5 ans", title: "Finitions Qualicoat", body: "Thermolaquage, teintes RAL, aspects anodisés." },
  { Icon: ShieldCheck, years: "2 ans", title: "Accessoires & pose", body: "Zip screens, panneaux vitrés, main d'œuvre de nos équipes." },
];

const included = [
  "Diagnostic à distance sous 24h ouvrées",
  "Intervention sur site sous 72h en France métropolitaine",
  "Pièces détachées d'origine, sans facturation",
  "Main d'œuvre incluse pendant toute la durée de garantie",
  "Réajustement annuel offert la 1ère année",
];

const notCovered = [
  "Dommages liés à un usage non conforme",
  "Chocs, vandalisme, catastrophes naturelles (couverts par votre assurance habitation)",
  "Modifications ou réparations effectuées par un tiers",
  "Usure normale des joints d'étanchéité (remplacement tous les 5 ans conseillé)",
];

export default async function GarantiePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PageHeader
        eyebrow="Engagement"
        title="Une garantie, une équipe, un seul interlocuteur."
        intro="Nous concevons nos pergolas pour durer. Nos garanties couvrent la structure, les motorisations, les finitions et la pose."
      />

      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {guarantees.map(({ Icon, years, title, body }) => (
              <div
                key={title}
                className="border-border/70 rounded-[var(--radius-lg)] border p-8"
              >
                <div className="text-accent">
                  <Icon className="size-6" />
                </div>
                <div className="text-accent mt-6 text-[10px] font-medium uppercase tracking-[0.25em]">
                  Garantie
                </div>
                <div className="mt-1 font-serif text-4xl">{years}</div>
                <h3 className="mt-4 font-serif text-lg">{title}</h3>
                <p className="text-secondary mt-2 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-muted py-24 md:py-32">
        <Container>
          <div className="grid gap-16 md:grid-cols-2">
            <div>
              <Eyebrow>Ce qui est couvert</Eyebrow>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                Nous prenons tout en charge.
              </h2>
              <ul className="mt-8 space-y-4">
                {included.map((s) => (
                  <li key={s} className="flex items-start gap-3 text-sm">
                    <span className="bg-accent/15 text-accent mt-0.5 inline-flex size-6 shrink-0 items-center justify-center rounded-full">
                      <Check className="size-3.5" />
                    </span>
                    {s}
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <Eyebrow>Ce qui n&apos;est pas couvert</Eyebrow>
              <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                Les exceptions à connaître.
              </h2>
              <ul className="text-secondary mt-8 space-y-4 text-sm">
                {notCovered.map((s) => (
                  <li
                    key={s}
                    className="border-border/60 border-b pb-4 last:border-none"
                  >
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>
    </>
  );
}
