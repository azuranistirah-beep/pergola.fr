import { setRequestLocale, getTranslations } from "next-intl/server";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductGrid } from "@/features/products/product-grid";
import { listProducts } from "@/repositories/product-repository";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "plp" });
  return { title: t("title"), description: t("intro") };
}

export const revalidate = 300;

export default async function PergolasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const products = await listProducts();
  const t = await getTranslations("plp");

  return (
    <>
      <section className="bg-muted pt-32 pb-16 md:pt-40 md:pb-24">
        <Container>
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-5xl leading-tight md:text-7xl">
            {t("title")}
          </h1>
          <p className="text-secondary mt-6 max-w-xl text-base">{t("intro")}</p>
        </Container>
      </section>
      <section className="py-16 md:py-24">
        <Container>
          <ProductGrid products={products} />
        </Container>
      </section>
    </>
  );
}
