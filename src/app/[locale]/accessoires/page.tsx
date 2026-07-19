import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/features/coming-soon/coming-soon";

export const metadata = {
  title: "Accessoires — Collection en préparation",
  description:
    "Éclairages LED, capteurs météo, chauffages, rideaux, mobilier — tout pour parfaire votre pergola.",
};

export default async function AccessoiresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      eyebrow="Nouvelle collection"
      title="Accessoires — L'attention au détail."
      intro="Éclairages LED périmétriques, capteurs pluie-vent, chauffages infrarouges, rideaux zip, mobilier assorti. Chaque accessoire dessiné pour dialoguer avec nos structures."
      gradient="linear-gradient(150deg, #4d4335 0%, #a17a4b 55%, #c8a46b 100%)"
      launchDate="Automne 2026"
      bullets={[
        "Bandeaux LED blanc chaud ou RGBW pilotable",
        "Capteurs Somfy pluie-vent, télécommandes multi-canaux",
        "Chauffages infrarouges IP65, télécommande",
        "Fauteuils et tables assortis (édition limitée)",
      ]}
    />
  );
}
