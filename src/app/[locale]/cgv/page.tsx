import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { LegalContent, LegalSection } from "@/features/legal/legal-content";

export const metadata = {
  title: "Conditions générales de vente",
  description:
    "Conditions générales de vente Pergola FR — commande, paiement, livraison, garantie, rétractation.",
};

export default async function CgvPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PageHeader
        eyebrow="Conditions"
        title="Conditions générales de vente"
        intro="Les présentes conditions régissent les ventes conclues entre Pergola FR SAS et ses clients particuliers ou professionnels via pergolafr.com."
      />
      <LegalContent>
        <LegalSection title="1. Prix">
          <p>
            Les prix sont indiqués en euros toutes taxes comprises (TVA 20 %).
            Ils incluent la livraison en France métropolitaine dès 2 000 €
            d&apos;achat. La pose n&apos;est incluse que si expressément
            choisie lors de la commande.
          </p>
        </LegalSection>

        <LegalSection title="2. Commande">
          <p>
            La commande est ferme à la validation du panier et du paiement. Un
            email de confirmation est envoyé sous 15 minutes. Toute
            configuration sur-mesure ne peut être annulée après confirmation
            écrite du bureau d&apos;études (48h ouvrées).
          </p>
        </LegalSection>

        <LegalSection title="3. Paiement">
          <p>
            Nous acceptons carte bancaire (Stripe), PayPal et virement SEPA.
            Le paiement en 3× sans frais est possible pour toute commande
            supérieure à 300 € via notre partenaire. Aucune donnée bancaire
            n&apos;est stockée sur nos serveurs.
          </p>
        </LegalSection>

        <LegalSection title="4. Livraison">
          <p>
            Délai standard : 4 à 6 jours à compter de la validation. Délai
            express : 3 jours (supplément 299 €). La livraison a lieu au
            pied du camion sur RDV. Pour les grandes structures, une équipe
            de 2 personnes minimum est requise côté client, ou l&apos;option
            « pose » doit être choisie.
          </p>
        </LegalSection>

        <LegalSection title="5. Droit de rétractation">
          <p>
            Conformément à l&apos;article L. 221-18 du Code de la
            consommation, vous disposez de 14 jours pour vous rétracter à
            compter de la réception. Les frais de retour sont à votre charge.
          </p>
          <p>
            <strong>Exception :</strong> les produits configurés sur-mesure
            (dimensions, coloris, options personnalisées) ne sont pas
            rétractables (art. L. 221-28, 3°).
          </p>
        </LegalSection>

        <LegalSection title="6. Garantie">
          <p>
            Structure porteuse : 10 ans. Motorisations et LED : 5 ans.
            Finitions (thermolaquage, teinte) : 5 ans. Ces garanties
            s&apos;ajoutent aux garanties légales de conformité et des vices
            cachés. Les détails figurent sur la page{" "}
            <a href="/garantie" className="text-primary underline underline-offset-4">
              Garantie
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection title="7. Réserve de propriété">
          <p>
            Le transfert de propriété n&apos;est effectif qu&apos;au paiement
            intégral du prix. Les risques sont transférés à la livraison.
          </p>
        </LegalSection>

        <LegalSection title="8. Litiges — Droit applicable">
          <p>
            Les présentes CGV sont régies par le droit français. En cas de
            litige, une solution amiable sera recherchée en priorité. À
            défaut, le tribunal compétent est celui du lieu de résidence du
            consommateur.
          </p>
        </LegalSection>
      </LegalContent>
    </>
  );
}
