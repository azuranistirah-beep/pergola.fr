import { setRequestLocale } from "next-intl/server";
import { Configurator } from "@/features/configurator/configurator";
import { bioclimaticConfigurator } from "@/features/configurator/configurator-data";
import { getProductBySlug } from "@/repositories/product-repository";

export const metadata = {
  title: "Configurateur — Pergola bioclimatique sur-mesure",
  description:
    "Composez votre pergola bioclimatique en direct : dimensions, coloris, motorisation, LED, zip screen, vitrage. Prix et référence SKU actualisés à chaque choix.",
};

export default async function ConfigurateurPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ produit?: string }>;
}) {
  const { locale } = await params;
  const { produit } = await searchParams;
  setRequestLocale(locale);

  // If a product slug was passed from the PDP, pre-fill the configurator so
  // the cart line, SKU prefix and hero name reflect that product.
  const product = produit ? await getProductBySlug(produit) : null;
  const cfg = product
    ? {
        ...bioclimaticConfigurator,
        productSlug: product.slug,
        basePriceCents: product.priceCents,
      }
    : bioclimaticConfigurator;

  return (
    <Configurator
      cfg={cfg}
      productName={product?.name}
      productImageUrl={product?.heroUrl}
    />
  );
}
