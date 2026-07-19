import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/features/coming-soon/coming-soon";

export const metadata = {
  title: "Carports — Collection en préparation",
  description:
    "Carports en aluminium ou cèdre, dessinés pour se fondre dans l'architecture. Bientôt disponible.",
};

export default async function CarportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      eyebrow="Nouvelle collection"
      title="Carports — Discrets, structurels."
      intro="Une gamme de carports mono-voiture, double, ou intégrés à une pergola bioclimatique. Aluminium extrudé thermolaqué, cèdre massif, ou combinaison des deux."
      gradient="linear-gradient(160deg, #1e1e1e 0%, #3a3a3a 60%, #5a5a5a 100%)"
      launchDate="Été 2026"
      bullets={[
        "Mono-voiture (3×5 m), double (5,5×5 m) et adossé maison",
        "Toits pleins, à lames orientables, ou en polycarbonate",
        "Panneaux solaires intégrables (option)",
        "Fondation micropieux ou plots béton",
      ]}
    />
  );
}
