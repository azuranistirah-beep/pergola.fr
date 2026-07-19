import { setRequestLocale } from "next-intl/server";
import { Truck, MapPin, Package, Clock, Wrench, ShieldCheck } from "lucide-react";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { formatEUR } from "@/lib/utils";

export const metadata = {
  title: "Livraison & pose",
  description:
    "Délais, zones de livraison, préparation du site, et options de pose par nos équipes.",
};

const steps = [
  {
    Icon: Package,
    title: "1. Fabrication",
    body: "3 à 5 semaines dans notre atelier de Vendée. Contrôle qualité au dixième, thermolaquage certifié Qualicoat.",
  },
  {
    Icon: Truck,
    title: "2. Expédition",
    body: "Prise de rendez-vous 48h avant la livraison. Camion adapté, hayon élévateur pour les grandes structures.",
  },
  {
    Icon: Wrench,
    title: "3. Pose",
    body: "Notre équipe fixe, ajuste et met en service la pergola. Nettoyage complet du site avant départ.",
  },
  {
    Icon: ShieldCheck,
    title: "4. Suivi",
    body: "Un chef de studio dédié reste joignable pendant toute la garantie. Interventions sous 72h en France métropolitaine.",
  },
];

const shippingOptions = [
  { label: "France métropolitaine — standard", delay: "4 à 6 semaines", price: "Offert dès 2 000 €", price_low: 14900 },
  { label: "France métropolitaine — express", delay: "3 semaines", price: "+ 299 €", price_low: 29900 },
  { label: "Pose par nos équipes", delay: "Ajouté au délai standard", price: "à partir de 1 490 €", price_low: 149000 },
  { label: "Belgique / Luxembourg / Suisse", delay: "5 à 7 semaines", price: "Sur devis", price_low: null },
];

export default async function LivraisonPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PageHeader
        eyebrow="Service"
        title="Livraison, pose & suivi."
        intro="Nous prenons en charge chaque étape, de la sortie d'atelier jusqu'à la mise en service chez vous."
      />

      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-4">
            {steps.map(({ Icon, title, body }) => (
              <div key={title}>
                <div className="border-accent/40 bg-accent/10 text-accent inline-flex size-14 items-center justify-center rounded-full border">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-6 font-serif text-xl">{title}</h3>
                <p className="text-secondary mt-3 text-sm leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <section className="bg-muted py-24 md:py-32">
        <Container>
          <Eyebrow>Options & tarifs</Eyebrow>
          <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-5xl">
            Un tarif clair, quel que soit votre projet.
          </h2>

          <div className="border-border/70 mt-12 overflow-hidden rounded-[var(--radius-lg)] border bg-background">
            {shippingOptions.map((opt, i) => (
              <div
                key={opt.label}
                className={`grid grid-cols-1 gap-2 p-6 md:grid-cols-[2fr_1fr_1fr] md:items-center md:gap-6 md:p-8 ${i > 0 ? "border-border border-t" : ""}`}
              >
                <div>
                  <div className="text-primary text-sm font-medium">
                    {opt.label}
                  </div>
                </div>
                <div className="text-secondary flex items-center gap-2 text-sm">
                  <Clock className="text-accent size-3.5" />
                  {opt.delay}
                </div>
                <div className="text-primary text-sm font-medium md:text-right">
                  {opt.price}
                </div>
              </div>
            ))}
          </div>

          <div className="text-secondary mt-8 flex items-start gap-3 text-sm">
            <MapPin className="text-accent mt-0.5 size-4 shrink-0" />
            <p>
              Livraison dans les DOM-TOM et hors Europe possible sur devis.
              Contactez notre équipe pour un chiffrage précis selon votre
              destination.
            </p>
          </div>
        </Container>
      </section>
    </>
  );
}
