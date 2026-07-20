import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/features/home/hero";
import { CategoryStrip } from "@/features/home/category-strip";
import { WhyChooseUs } from "@/features/home/why-choose-us";
import { ConfiguratorTeaser } from "@/features/home/configurator-teaser";
import { CustomerProjects } from "@/features/home/customer-projects";
import { Testimonials } from "@/features/home/testimonials";
import { LatestJournal } from "@/features/home/latest-journal";
import { CtaShowroom } from "@/features/home/cta-showroom";
import { listProducts } from "@/repositories/product-repository";
import { getContent } from "@/repositories/settings-repository";

export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [products, content] = await Promise.all([listProducts(), getContent()]);

  return (
    <>
      <Hero content={content} />
      <CategoryStrip products={products} />
      <ConfiguratorTeaser />
      <WhyChooseUs />
      <CustomerProjects />
      <Testimonials />
      <LatestJournal />
      <CtaShowroom />
    </>
  );
}
