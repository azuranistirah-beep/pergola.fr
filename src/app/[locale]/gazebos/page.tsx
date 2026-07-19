import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/features/coming-soon/coming-soon";

export const metadata = {
  title: "Gazebos — Collection en préparation",
  description:
    "Une nouvelle famille de gazebos en cèdre massif, pensés pour prolonger vos étés. Bientôt disponible.",
};

export default async function GazebosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      eyebrow="Nouvelle collection"
      title="Gazebos — L'art du rassemblement."
      intro="Une famille de gazebos hexagonaux et rectangulaires, en cèdre massif, avec panneaux d'intimité en aluminium découpé. Fabriqués dans notre atelier de Vendée."
      gradient="linear-gradient(150deg, #3b2a1a 0%, #6a4a2c 55%, #a17a4b 100%)"
      launchDate="Printemps 2026"
      bullets={[
        "5 formats, du gazebo 3×3 m à la structure 6×4 m",
        "Panneaux d'intimité bambou ou pebble, motifs signés Atelier Rivière",
        "Options : éclairage LED, moustiquaires, rideaux zip",
        "Livraison France entière, pose incluse en option",
      ]}
    />
  );
}
