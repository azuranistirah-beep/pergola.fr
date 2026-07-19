import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { LegalContent, LegalSection } from "@/features/legal/legal-content";

export const metadata = {
  title: "Politique de confidentialité",
  description:
    "Comment nous collectons, utilisons et protégeons vos données personnelles chez Pergola FR.",
};

export default async function ConfidentialitePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PageHeader
        eyebrow="Vie privée"
        title="Politique de confidentialité"
        intro="Nous prenons la protection de vos données personnelles très au sérieux. Cette politique décrit les données collectées, leur utilisation et vos droits."
      />
      <LegalContent>
        <LegalSection title="Responsable de traitement">
          <p>
            Pergola FR SAS, 12 rue de Rivoli, 75004 Paris, désigne comme
            responsable du traitement des données collectées via ce site.
          </p>
        </LegalSection>

        <LegalSection title="Données collectées">
          <p>Nous collectons uniquement les données nécessaires à :</p>
          <ul className="ml-5 mt-2 list-disc space-y-1.5">
            <li>La création et la gestion de votre compte client</li>
            <li>Le traitement de vos commandes et devis</li>
            <li>La livraison et l&apos;installation de nos produits</li>
            <li>La facturation et la comptabilité</li>
            <li>L&apos;envoi de notre newsletter (avec votre consentement)</li>
            <li>L&apos;amélioration continue du site</li>
          </ul>
        </LegalSection>

        <LegalSection title="Base légale">
          <p>
            Les traitements reposent selon les cas sur l&apos;exécution du
            contrat (commande, livraison), le consentement (newsletter,
            cookies non essentiels), ou notre intérêt légitime (sécurité,
            statistiques anonymisées).
          </p>
        </LegalSection>

        <LegalSection title="Durée de conservation">
          <p>
            Compte client : durée de vie du compte + 3 ans après la dernière
            activité. Factures : 10 ans (obligation légale). Newsletter :
            jusqu&apos;au désabonnement. Cookies : 13 mois maximum.
          </p>
        </LegalSection>

        <LegalSection title="Destinataires">
          <p>
            Vos données ne sont jamais vendues. Elles sont partagées
            uniquement avec :
          </p>
          <ul className="ml-5 mt-2 list-disc space-y-1.5">
            <li>Notre équipe (livraison, service client)</li>
            <li>Nos transporteurs partenaires (livraison uniquement)</li>
            <li>Stripe / PayPal (paiement)</li>
            <li>Les autorités légalement habilitées en cas de réquisition</li>
          </ul>
        </LegalSection>

        <LegalSection title="Vos droits">
          <p>
            Conformément au RGPD, vous disposez d&apos;un droit d&apos;accès,
            de rectification, d&apos;effacement, de limitation,
            d&apos;opposition et de portabilité sur vos données. Pour exercer
            ces droits, écrivez à{" "}
            <a
              href="mailto:privacy@pergolafr.com"
              className="text-primary underline underline-offset-4"
            >
              privacy@pergolafr.com
            </a>{" "}
            en joignant une copie d&apos;une pièce d&apos;identité.
          </p>
          <p>
            Vous pouvez également introduire une réclamation auprès de la
            CNIL — 3 Place de Fontenoy, 75007 Paris —{" "}
            <a
              href="https://www.cnil.fr"
              className="text-primary underline underline-offset-4"
              target="_blank"
              rel="noreferrer noopener"
            >
              cnil.fr
            </a>
            .
          </p>
        </LegalSection>

        <LegalSection title="Sécurité">
          <p>
            Toutes les données sont hébergées dans l&apos;Union européenne,
            chiffrées en transit (TLS 1.3) et au repos (AES-256). Aucun mot de
            passe n&apos;est stocké en clair.
          </p>
        </LegalSection>
      </LegalContent>
    </>
  );
}
