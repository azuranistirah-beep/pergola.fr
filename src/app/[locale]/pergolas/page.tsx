import { setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductGrid } from "@/features/products/product-grid";

export const metadata = {
  title: "Pergolas — Collection complète",
  description:
    "Découvrez toutes nos pergolas en cèdre, acier et à lames orientables. Fabrication soignée, livraison France entière.",
};

export default async function PergolasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <section className="bg-muted pt-32 pb-16 md:pt-40 md:pb-24">
        <Container>
          <Eyebrow>Collection</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            Toutes nos pergolas
          </h1>
          <p className="text-secondary mt-6 max-w-xl text-base">
            Cèdre massif, acier galvanisé, lames orientables ou voile
            d&apos;ombrage — la structure qui prolonge votre intérieur au grand
            air.
          </p>
        </Container>
      </section>
      <section className="py-16 md:py-24">
        <Container>
          <ProductGrid />
        </Container>
      </section>
    </>
  );
}
