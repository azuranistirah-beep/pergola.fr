import { setRequestLocale } from "next-intl/server";
import { PageHeader } from "@/components/layout/page-header";
import { LegalContent, LegalSection } from "@/features/legal/legal-content";
import { getSiteInfo } from "@/repositories/settings-repository";

export const metadata = {
  title: "Mentions légales",
  description:
    "Éditeur, hébergeur et propriété intellectuelle du site pergolafr.com.",
};

export default async function MentionsLegalesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const site = await getSiteInfo();
  return (
    <>
      <PageHeader
        eyebrow="Légal"
        title="Mentions légales"
        intro="Informations relatives à l'éditeur du site pergolafr.com, conformément à la loi n° 2004-575 du 21 juin 2004 pour la confiance dans l'économie numérique."
      />
      <LegalContent>
        <LegalSection title="Éditeur du site">
          <p>
            <strong>Pergola FR SAS</strong>
            <br />
            SAS au capital de 250 000 €<br />
            RCS Paris 892 456 789<br />
            SIRET : 892 456 789 00012<br />
            TVA intracommunautaire : FR 12 892456789
          </p>
          <p>
            Siège social : {site.showroomAddress}
            <br />
            Téléphone : {site.phone}
            <br />
            Email : {site.email}
          </p>
          <p>Directeur de la publication : Antoine Rivière, Président.</p>
        </LegalSection>

        <LegalSection title="Hébergement">
          <p>
            Le site est hébergé sur l&apos;infrastructure InsForge Cloud
            (région eu-central), opérée par InsForge Inc.
          </p>
        </LegalSection>

        <LegalSection title="Propriété intellectuelle">
          <p>
            L&apos;ensemble des éléments présents sur ce site (textes,
            photographies, illustrations, logos, marques, configurateur,
            dessins techniques) est la propriété exclusive de Pergola FR SAS ou
            fait l&apos;objet d&apos;une autorisation d&apos;usage. Toute
            reproduction, représentation ou diffusion, totale ou partielle, est
            interdite sans autorisation préalable écrite.
          </p>
        </LegalSection>

        <LegalSection title="Données personnelles">
          <p>
            Les traitements de données à caractère personnel effectués depuis
            ce site sont détaillés dans notre{" "}
            <a
              href="/confidentialite"
              className="text-primary underline underline-offset-4"
            >
              politique de confidentialité
            </a>
            . Conformément au RGPD, vous disposez d&apos;un droit
            d&apos;accès, de rectification, d&apos;effacement et
            d&apos;opposition sur vos données.
          </p>
        </LegalSection>

        <LegalSection title="Cookies">
          <p>
            Ce site utilise des cookies techniques indispensables à son
            fonctionnement, et des cookies statistiques anonymisés. Aucun
            cookie publicitaire n&apos;est déposé.
          </p>
        </LegalSection>

        <LegalSection title="Médiation de la consommation">
          <p>
            Conformément à l&apos;article L. 612-1 du Code de la consommation,
            en cas de litige non résolu, vous pouvez recourir gratuitement au
            service de médiation MEDICYS — 73 Boulevard de Clichy, 75009 Paris.
          </p>
        </LegalSection>
      </LegalContent>
    </>
  );
}
