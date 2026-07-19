import { setRequestLocale } from "next-intl/server";
import { Hero } from "@/features/home/hero";
import { CategoryStrip } from "@/features/home/category-strip";
import { WhyChooseUs } from "@/features/home/why-choose-us";
import { ConfiguratorTeaser } from "@/features/home/configurator-teaser";
import { Testimonials } from "@/features/home/testimonials";
import { CtaShowroom } from "@/features/home/cta-showroom";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <>
      <Hero />
      <CategoryStrip />
      <ConfiguratorTeaser />
      <WhyChooseUs />
      <Testimonials />
      <CtaShowroom />
    </>
  );
}
