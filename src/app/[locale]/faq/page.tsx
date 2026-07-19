import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { FaqAccordion } from "@/features/faq/faq-accordion";

export const metadata = {
  title: "FAQ — Questions fréquentes",
  description:
    "Livraison, pose, garantie, configurateur, paiement — toutes les réponses à vos questions.",
};

const groups = [
  {
    title: "Avant l'achat",
    items: [
      {
        q: "Puis-je visiter votre showroom avant de commander ?",
        a: "Oui, notre showroom du Marais (75004 Paris) est ouvert du mardi au samedi. Vous pouvez prendre rendez-vous depuis notre page contact — un conseiller vous reçoit avec les matières, les nuanciers et une démonstration du configurateur.",
      },
      {
        q: "Comment fonctionne le configurateur ?",
        a: "Chaque choix (dimensions, coloris, motorisation, LED, zip screen) recalcule instantanément le prix, la référence SKU et l'aperçu 3D. À la fin, vous pouvez ajouter au panier, demander un devis PDF ou prendre rendez-vous avec un conseiller.",
      },
      {
        q: "Proposez-vous des devis gratuits ?",
        a: "Oui, tout devis est gratuit et sans engagement. Le bureau d'études revient vers vous sous 48h ouvrées avec une proposition chiffrée et un plan technique.",
      },
    ],
  },
  {
    title: "Commande & paiement",
    items: [
      {
        q: "Quels moyens de paiement acceptez-vous ?",
        a: "Carte bancaire (Visa, Mastercard, Amex) via Stripe, PayPal, virement SEPA. Le paiement en 3× sans frais est disponible dès 300 € via notre partenaire.",
      },
      {
        q: "Mes coordonnées bancaires sont-elles sécurisées ?",
        a: "Oui. Nous ne stockons aucune donnée bancaire — toutes les transactions passent par les infrastructures certifiées PCI-DSS de nos partenaires (Stripe, PayPal).",
      },
      {
        q: "Puis-je annuler ma commande après paiement ?",
        a: "Vous disposez de 14 jours de rétractation pour les produits standard. Les configurations sur-mesure ne sont pas rétractables une fois validées par notre bureau d'études (48h ouvrées après commande).",
      },
    ],
  },
  {
    title: "Livraison & pose",
    items: [
      {
        q: "Quels sont les délais de livraison ?",
        a: "4 à 6 semaines pour une commande standard, 3 semaines en express (+299 €). Le délai commence à la validation du bureau d'études pour les configurations sur-mesure.",
      },
      {
        q: "Livrez-vous partout en France ?",
        a: "Oui, en France métropolitaine (livraison offerte dès 2 000 €). Nous livrons également en Belgique, au Luxembourg, en Suisse et dans les DOM-TOM sur devis.",
      },
      {
        q: "Faites-vous la pose ?",
        a: "Oui, l'option « pose par nos équipes » démarre à 1 490 €. Nos installateurs sont formés en usine et interviennent sur RDV. Pour la version standard, le kit est livré prêt à poser avec notice illustrée et accès vidéo YouTube.",
      },
      {
        q: "Ai-je besoin d'une dalle béton ?",
        a: "Pas systématiquement. Nos pergolas se fixent sur sol dur existant (dalle, terrasse, pavés). Pour les grands formats, nous conseillons 4 plots béton scellés (option disponible). Une dalle complète est proposée pour les projets clef en main.",
      },
    ],
  },
  {
    title: "Garantie & entretien",
    items: [
      {
        q: "Quelle est la durée de la garantie ?",
        a: "10 ans sur la structure porteuse, 5 ans sur les motorisations, LED et finitions Qualicoat, 2 ans sur les accessoires. Détails complets sur notre page Garantie.",
      },
      {
        q: "Comment entretenir ma pergola ?",
        a: "Un nettoyage 1 à 2 fois par an à l'eau tiède savonneuse suffit. Évitez les produits abrasifs et les nettoyeurs haute pression sur les finitions thermolaquées. Un rendez-vous d'inspection annuel est offert la première année.",
      },
      {
        q: "Que faire en cas de panne ?",
        a: "Contactez votre chef de studio (indiqué sur votre bon de livraison) ou notre hotline. Diagnostic à distance sous 24h ouvrées, intervention sur site sous 72h en France métropolitaine.",
      },
    ],
  },
];

export default async function FaqPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PageHeader
        eyebrow="FAQ"
        title="Questions fréquentes."
        intro="Les réponses aux questions que nos clients posent le plus souvent. Vous ne trouvez pas la vôtre ? Contactez-nous."
      />

      <section className="py-24 md:py-32">
        <Container className="max-w-4xl">
          <div className="space-y-16">
            {groups.map((g) => (
              <div key={g.title}>
                <Eyebrow>{g.title}</Eyebrow>
                <h2 className="mt-4 mb-8 font-serif text-3xl leading-tight md:text-4xl">
                  {g.title}
                </h2>
                <FaqAccordion items={g.items} />
              </div>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
