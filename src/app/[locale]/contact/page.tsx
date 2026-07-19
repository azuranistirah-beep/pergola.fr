import { setRequestLocale } from "next-intl/server";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ContactForm } from "@/features/contact/contact-form";

export const metadata = {
  title: "Contact — Showroom Paris",
  description:
    "Notre équipe vous accompagne. Showroom du Marais, hotline 7j/7, formulaire de contact.",
};

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <div className="pt-28 pb-24 md:pt-32">
      <Container>
        <div className="grid gap-16 md:grid-cols-[1.4fr_1fr]">
          <div>
            <Eyebrow>Nous contacter</Eyebrow>
            <h1 className="mt-4 font-serif text-5xl leading-tight md:text-7xl">
              Parlons de votre projet.
            </h1>
            <p className="text-secondary mt-6 max-w-lg text-base">
              Nos conseillers vous accompagnent, matières en main, dans notre
              showroom parisien du Marais. Devis chiffré sous 48h.
            </p>

            <ContactForm />
          </div>

          <aside className="space-y-6">
            <InfoCard
              Icon={MapPin}
              title="Showroom Paris"
              lines={[
                "12 rue de Rivoli",
                "75004 Paris — Le Marais",
                "Ouvert du mardi au samedi, 10h–19h",
              ]}
            />
            <InfoCard
              Icon={Phone}
              title="Hotline"
              lines={["+33 1 84 88 00 00", "Lun–Sam, 9h–19h"]}
            />
            <InfoCard
              Icon={Mail}
              title="Email"
              lines={["bonjour@pergolafr.com"]}
            />
            <InfoCard
              Icon={MessageCircle}
              title="WhatsApp"
              lines={["+33 6 12 34 56 78 — Devis express en 2h"]}
            />
          </aside>
        </div>

        {/* Showroom map */}
        <div className="mt-16 aspect-[16/6] w-full overflow-hidden rounded-[var(--radius-lg)]">
          <iframe
            title="Localisation showroom Pergola FR — 12 rue de Rivoli, 75004 Paris"
            src="https://www.openstreetmap.org/export/embed.html?bbox=2.3552%2C48.8546%2C2.3620%2C48.8582&layer=mapnik&marker=48.8564%2C2.3586"
            className="h-full w-full grayscale-[0.4]"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          />
        </div>
      </Container>
    </div>
  );
}


function InfoCard({
  Icon,
  title,
  lines,
}: {
  Icon: typeof Mail;
  title: string;
  lines: string[];
}) {
  return (
    <div className="border-border rounded-[var(--radius-lg)] border p-6">
      <div className="text-accent">
        <Icon className="size-5" />
      </div>
      <h3 className="mt-4 font-serif text-lg">{title}</h3>
      <div className="text-secondary mt-3 space-y-1 text-sm">
        {lines.map((l) => (
          <div key={l}>{l}</div>
        ))}
      </div>
    </div>
  );
}
