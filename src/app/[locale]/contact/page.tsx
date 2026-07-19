import { setRequestLocale } from "next-intl/server";
import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";

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

            <form className="mt-12 grid gap-5">
              <Field label="Prénom et nom" name="name" required />
              <div className="grid gap-5 md:grid-cols-2">
                <Field label="Email" type="email" name="email" required />
                <Field label="Téléphone" type="tel" name="phone" />
              </div>
              <Field label="Code postal" name="postal" />
              <div className="flex flex-col gap-2">
                <label className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                  Votre projet
                </label>
                <textarea
                  name="message"
                  rows={5}
                  required
                  placeholder="Type de pergola envisagée, dimensions approximatives, contraintes du site…"
                  className="border-border focus:border-primary bg-transparent border-b py-3 text-sm outline-none placeholder:text-secondary/50 resize-none"
                />
              </div>
              <Button variant="primary" size="lg" className="w-full sm:w-auto">
                Envoyer ma demande
              </Button>
              <p className="text-secondary text-xs">
                En envoyant ce formulaire, vous acceptez notre politique de
                confidentialité. Nous vous répondons sous 48h ouvrées.
              </p>
            </form>
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

        {/* Map placeholder */}
        <div
          className="mt-16 aspect-[16/6] w-full overflow-hidden rounded-[var(--radius-lg)]"
          style={{
            background:
              "linear-gradient(135deg, #e4dcc9 0%, #b8a582 60%, #7a6446 100%)",
          }}
          aria-label="Localisation showroom"
        />
      </Container>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label
        htmlFor={name}
        className="text-secondary text-[10px] uppercase tracking-[0.25em]"
      >
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        className="border-border focus:border-primary bg-transparent border-b py-3 text-sm outline-none placeholder:text-secondary/50"
      />
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
