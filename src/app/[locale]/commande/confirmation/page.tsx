import { setRequestLocale } from "next-intl/server";
import {
  Calendar,
  Check,
  Download,
  Mail,
  Package,
  Truck,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { formatEUR } from "@/lib/utils";

export const metadata = {
  title: "Commande confirmée",
  description: "Merci pour votre commande — voici les prochaines étapes.",
  robots: { index: false, follow: false },
};

const steps = [
  {
    Icon: Mail,
    title: "Confirmation par email",
    body: "Vous recevez sous 15 minutes un email avec votre facture PDF et un lien de suivi.",
    time: "0 – 15 min",
  },
  {
    Icon: Package,
    title: "Validation du bureau d'études",
    body: "Nos ingénieurs vérifient la configuration et valident le plan technique.",
    time: "24 – 48h",
  },
  {
    Icon: Calendar,
    title: "Fabrication",
    body: "Votre pergola prend forme dans notre atelier de Vendée.",
    time: "3 – 5 semaines",
  },
  {
    Icon: Truck,
    title: "Livraison & pose",
    body: "Notre équipe vous contacte 48h avant pour convenir d'un créneau.",
    time: "6 – 8 semaines",
  },
];

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="relative pt-32 pb-24 md:pt-40">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[520px]"
        style={{
          background:
            "radial-gradient(60% 60% at 50% 0%, rgba(200,164,107,0.20) 0%, rgba(200,164,107,0) 60%)",
        }}
      />

      <Container>
        <div className="mx-auto max-w-3xl text-center">
          <div className="border-accent/50 bg-accent/10 text-accent mx-auto inline-flex size-16 items-center justify-center rounded-full border">
            <Check className="size-7" />
          </div>
          <Eyebrow className="mt-8">Commande confirmée</Eyebrow>
          <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
            Merci Camille, votre pergola est en route.
          </h1>
          <p className="text-secondary mt-6 text-base">
            Un email de confirmation vous a été envoyé à{" "}
            <strong className="text-primary">c.riviere@example.fr</strong>. Voici
            un récapitulatif de votre commande et les prochaines étapes.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <div className="border-border/70 grid gap-6 rounded-[var(--radius-lg)] border p-8 md:grid-cols-3">
            <Summary
              label="Référence"
              value="PGL-2026-00184"
              mono
            />
            <Summary label="Total TTC" value={formatEUR(849000)} />
            <Summary label="Paiement" value="Carte Visa •••• 4242" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2">
            <Button variant="primary" size="lg" className="w-full">
              <Download /> Télécharger la facture
            </Button>
            <Button asChild variant="outline" size="lg" className="w-full">
              <Link href="/compte">Suivre ma commande</Link>
            </Button>
          </div>
        </div>

        <div className="mx-auto mt-24 max-w-4xl">
          <Eyebrow>Prochaines étapes</Eyebrow>
          <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
            Ce qui vous attend.
          </h2>

          <ol className="border-border/60 mt-10 divide-border/60 divide-y overflow-hidden rounded-[var(--radius-lg)] border">
            {steps.map(({ Icon, title, body, time }, i) => (
              <li
                key={title}
                className="grid gap-4 p-6 md:grid-cols-[auto_1fr_auto] md:items-center md:gap-8 md:p-8"
              >
                <div className="border-accent/30 bg-accent/10 text-accent inline-flex size-12 items-center justify-center rounded-full border">
                  <Icon className="size-5" />
                </div>
                <div>
                  <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                    Étape {i + 1}
                  </div>
                  <h3 className="mt-1 font-serif text-lg leading-tight">
                    {title}
                  </h3>
                  <p className="text-secondary mt-2 text-sm">{body}</p>
                </div>
                <div className="text-accent text-xs font-medium uppercase tracking-[0.2em] md:text-right">
                  {time}
                </div>
              </li>
            ))}
          </ol>
        </div>
      </Container>
    </div>
  );
}

function Summary({
  label,
  value,
  mono,
}: {
  label: string;
  value: string;
  mono?: boolean;
}) {
  return (
    <div>
      <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
        {label}
      </div>
      <div
        className={`mt-2 text-primary text-lg ${mono ? "font-mono" : "font-serif"}`}
      >
        {value}
      </div>
    </div>
  );
}
