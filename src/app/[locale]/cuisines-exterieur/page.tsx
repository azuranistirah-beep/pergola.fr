import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/features/coming-soon/coming-soon";

export const metadata = {
  title: "Cuisines d'extérieur — Collection en préparation",
  description:
    "Îlots de cuisine sur-mesure, plancha, grill, évier — pour transformer votre pergola en salle à manger d'été.",
};

export default async function CuisinesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      eyebrow="Nouvelle collection"
      title="Cuisines d'extérieur — Le grand air à table."
      intro="Îlots modulaires, plans de travail en Dekton, plancha, grill, évier, cave à vin. Configurable au centimètre près, à intégrer sous votre pergola."
      gradient="linear-gradient(140deg, #2b1f16 0%, #58402b 55%, #c8a46b 110%)"
      launchDate="Été 2026"
      bullets={[
        "Plans de travail Dekton, granit, ou inox brossé",
        "Modules : plancha gaz, grill charbon, wok, teppanyaki, four à pizza",
        "Évier, cave à vin ventilée, mini-frigo intégré",
        "Configurateur dédié, prix et rendu 3D en direct",
      ]}
    />
  );
}
