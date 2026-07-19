import { setRequestLocale } from "next-intl/server";
import { Configurator } from "@/features/configurator/configurator";
import { bioclimaticConfigurator } from "@/features/configurator/configurator-data";

export const metadata = {
  title: "Configurateur — Pergola bioclimatique sur-mesure",
  description:
    "Composez votre pergola bioclimatique en direct : dimensions, coloris, motorisation, LED, zip screen, vitrage. Prix et référence SKU actualisés à chaque choix.",
};

export default async function ConfigurateurPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Configurator cfg={bioclimaticConfigurator} />;
}
