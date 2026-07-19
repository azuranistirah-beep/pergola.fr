import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Award, Factory, Leaf, MapPin } from "lucide-react";

export const metadata = {
  title: "Maison Pergola FR — Notre histoire",
  description:
    "Fondée à Paris, fabriquée en Vendée. Une maison française dédiée à l'art de vivre dehors depuis 12 ans.",
};

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <section className="bg-muted pt-32 pb-16 md:pt-40 md:pb-24">
        <Container>
          <Eyebrow>La Maison</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            L&apos;art de vivre dehors, savoir-faire français.
          </h1>
          <p className="text-secondary mt-8 max-w-2xl text-lg leading-relaxed">
            Depuis 2014, nous dessinons à Paris et fabriquons en Vendée des
            structures d&apos;extérieur pensées pour durer. Chaque pièce est
            singulière, chaque projet suivi par un chef de studio dédié.
          </p>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <div className="grid gap-16 md:grid-cols-2 md:items-center">
            <div
              className="aspect-[4/5] rounded-[var(--radius-lg)]"
              style={{
                background:
                  "linear-gradient(140deg, #3b2a1a 0%, #6a4a2c 55%, #a17a4b 110%)",
              }}
            />
            <div>
              <Eyebrow>Atelier Vendée</Eyebrow>
              <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                Chaque profil, extrudé chez nous.
              </h2>
              <p className="text-secondary mt-6 text-base">
                Notre atelier des Herbiers travaille l&apos;aluminium extrudé,
                le cèdre PEFC et l&apos;acier galvanisé. Machines à commande
                numérique, contrôles qualité au dixième, thermolaquage certifié
                Qualicoat. Rien ne quitte l&apos;atelier sans passer par les
                mains de nos artisans.
              </p>
              <dl className="mt-10 grid grid-cols-2 gap-y-6">
                {[
                  ["3 200 m²", "Atelier de production"],
                  ["42", "Compagnons"],
                  ["4 semaines", "Délai moyen sur-mesure"],
                  ["100%", "Fabriqué en France"],
                ].map(([k, v]) => (
                  <div key={v}>
                    <dt className="font-serif text-3xl">{k}</dt>
                    <dd className="text-secondary mt-1 text-xs uppercase tracking-[0.2em]">
                      {v}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-primary text-primary-foreground py-24 md:py-32">
        <Container>
          <div className="mx-auto mb-16 max-w-2xl text-center">
            <Eyebrow className="text-accent">Nos engagements</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              Une exigence, à chaque étape.
            </h2>
          </div>
          <div className="grid gap-8 md:grid-cols-4">
            {[
              { Icon: MapPin, title: "Dessin à Paris", body: "Studio de design intégré au showroom du Marais." },
              { Icon: Factory, title: "Atelier Vendée", body: "Fabrication artisanale, machines à commande numérique." },
              { Icon: Leaf, title: "Éco-conçu", body: "Aluminium recyclable, cèdre PEFC, LED basse consommation." },
              { Icon: Award, title: "Distingué", body: "Prix Janus de l'Industrie, référencé Architectes du Patrimoine." },
            ].map(({ Icon, title, body }) => (
              <div key={title}>
                <div className="border-accent/40 bg-accent/10 text-accent inline-flex size-14 items-center justify-center rounded-full border">
                  <Icon className="size-6" />
                </div>
                <h3 className="mt-6 font-serif text-xl">{title}</h3>
                <p className="text-primary-foreground/70 mt-3 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
