import { notFound } from "next/navigation";
import { setRequestLocale, getTranslations } from "next-intl/server";
import {
  ChevronRight,
  Truck,
  ShieldCheck,
  Ruler,
  Palette,
  Wrench,
  Check,
} from "lucide-react";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Link } from "@/i18n/navigation";
import { formatEUR } from "@/lib/utils";
import {
  getProductBySlug,
  listProductSlugs,
  listRelatedProducts,
} from "@/repositories/product-repository";
import { ProductGallery } from "@/features/products/product-gallery";
import { ProductCard } from "@/features/products/product-card";
import { ProductReviews } from "@/features/products/product-reviews";
import { ProductDownloads } from "@/features/products/product-downloads";

export async function generateStaticParams() {
  const slugs = await listProductSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string; locale: string }>;
}) {
  const { slug, locale } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  const description =
    product.tagline ||
    `${product.name} — ${product.widthFt}×${product.lengthFt} ft, ${product.material}. ${formatEUR(product.priceCents)}. Livraison France.`;
  const canonical = `/${locale}/pergolas/${slug}`;
  return {
    title: product.name,
    description,
    alternates: {
      canonical,
      languages: {
        fr: `/fr/pergolas/${slug}`,
        en: `/en/pergolas/${slug}`,
      },
    },
    openGraph: {
      type: "website",
      title: product.name,
      description,
      images: product.heroUrl ? [{ url: product.heroUrl }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: product.name,
      description,
      images: product.heroUrl ? [product.heroUrl] : undefined,
    },
  };
}

export default async function ProductDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const product = await getProductBySlug(slug);
  if (!product) notFound();
  const related = await listRelatedProducts(product);
  const t = await getTranslations("pdp");

  const roofValue =
    product.family === "sarasota" || product.family === "evanston"
      ? t("specsValues.roofLouvered")
      : product.family === "brendan" || product.family === "windham"
        ? t("specsValues.roofSail")
        : t("specsValues.roofDefault");
  const structureValue =
    product.material === "wood"
      ? t("specsValues.structureWood")
      : t("specsValues.structureSteel");

  const productJsonLd = {
    "@context": "https://schema.org/",
    "@type": "Product",
    name: product.name,
    description: product.tagline,
    sku: product.sku,
    brand: { "@type": "Brand", name: "Pergola FR" },
    image: product.heroUrl ? [product.heroUrl] : undefined,
    material:
      product.material === "wood"
        ? "Solid cedar"
        : product.material === "steel"
          ? "Galvanised steel"
          : "Extruded aluminium",
    width: {
      "@type": "QuantitativeValue",
      value: product.widthCm,
      unitCode: "CMT",
    },
    depth: {
      "@type": "QuantitativeValue",
      value: product.lengthCm,
      unitCode: "CMT",
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "EUR",
      price: (product.priceCents / 100).toFixed(2),
      availability: "https://schema.org/InStock",
      url: `https://pergolafr.com/${locale}/pergolas/${slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <Container className="pt-28 md:pt-32">
        <nav className="text-secondary flex items-center gap-2 text-xs">
          <Link href="/" className="hover:text-primary">
            {t("breadcrumbHome")}
          </Link>
          <ChevronRight className="size-3" />
          <Link href="/pergolas" className="hover:text-primary">
            {t("breadcrumbCollection")}
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-primary">{product.name}</span>
        </nav>
      </Container>

      <section className="pt-8 pb-24 md:pt-12 md:pb-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
            <ProductGallery product={product} />

            <div className="lg:sticky lg:top-32 lg:self-start">
              <Eyebrow>{t(`materialLabel.${product.material}`)}</Eyebrow>
              <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                {product.name}
              </h1>
              <p className="text-secondary mt-4 text-base">{product.tagline}</p>

              <div className="border-border mt-8 border-t border-b py-6">
                <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                  {t("priceEyebrow")}
                </div>
                <div className="mt-2 flex items-baseline gap-4">
                  <span className="font-serif text-4xl">
                    {formatEUR(product.priceCents)}
                  </span>
                  <span className="text-secondary text-xs">
                    {t("installments", {
                      amount: formatEUR(Math.round(product.priceCents / 3)),
                    })}
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <Spec
                  Icon={Ruler}
                  label={t("specDim")}
                  value={`${product.widthFt}′ × ${product.lengthFt}′ (${(product.widthCm / 100).toFixed(2)}×${(product.lengthCm / 100).toFixed(2)} m)`}
                />
                <Spec
                  Icon={Palette}
                  label={t("specFinish")}
                  value={product.finish ?? t("finishDefault")}
                />
                <Spec
                  Icon={ShieldCheck}
                  label={t("specWarranty")}
                  value={t("warrantyYears")}
                />
                <Spec
                  Icon={Truck}
                  label={t("specShipping")}
                  value={t("shippingDelay")}
                />
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Button asChild variant="primary" size="lg" className="w-full">
                  <Link href={`/configurateur?produit=${product.slug}`}>
                    {t("ctaConfigure")}
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/contact">{t("ctaQuote")}</Link>
                </Button>
              </div>

              <ul className="text-secondary mt-8 space-y-2 text-sm">
                {(t.raw("usps") as string[]).map((s) => (
                  <li key={s} className="flex items-start gap-2">
                    <Check className="text-accent mt-0.5 size-4 shrink-0" />
                    {s}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Container>
      </section>

      <section className="bg-muted py-24 md:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
            <div>
              <Eyebrow>{t("specsEyebrow")}</Eyebrow>
              <h2 className="mt-4 font-serif text-4xl leading-tight">
                {t("specsTitle")}
              </h2>
              <p className="text-secondary mt-6 text-sm">{t("specsIntro")}</p>
            </div>
            <dl className="border-border grid gap-px bg-border overflow-hidden rounded-[var(--radius-lg)]">
              {[
                [t("specsRows.sku"), product.sku],
                [t("specsRows.material"), t(`materialLabel.${product.material}`)],
                [t("specsRows.structure"), structureValue],
                [t("specsRows.roof"), roofValue],
                [
                  t("specsRows.footprint"),
                  `${(product.widthCm / 100).toFixed(2)} × ${(product.lengthCm / 100).toFixed(2)} m`,
                ],
                [t("specsRows.fixation"), t("specsValues.fixation")],
                [t("specsRows.wind"), t("specsValues.wind")],
                [t("specsRows.origin"), t("specsValues.origin")],
              ].map(([k, v]) => (
                <div
                  key={k}
                  className="bg-background flex flex-col justify-between gap-1 p-6 md:flex-row md:items-baseline"
                >
                  <dt className="text-secondary text-xs uppercase tracking-[0.2em]">
                    {k}
                  </dt>
                  <dd className="text-primary text-sm md:text-right">{v}</dd>
                </div>
              ))}
            </dl>
          </div>
        </Container>
      </section>

      <section className="py-24 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>{t("included.eyebrow")}</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              {t("included.title")}
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {(
              [
                { key: "kit", Icon: Wrench },
                { key: "guide", Icon: Ruler },
                { key: "warranty", Icon: ShieldCheck },
              ] as const
            ).map(({ key, Icon }) => (
              <div
                key={key}
                className="bg-muted rounded-[var(--radius-lg)] p-8"
              >
                <Icon className="text-accent size-6" />
                <h3 className="mt-6 font-serif text-xl">
                  {t(`included.${key}.title`)}
                </h3>
                <p className="text-secondary mt-3 text-sm">
                  {t(`included.${key}.body`)}
                </p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <ProductDownloads />
      <ProductReviews />

      {related.length > 0 && (
        <section className="pb-24 md:pb-32">
          <Container>
            <div className="mb-12 flex items-end justify-between">
              <div>
                <Eyebrow>{t("related.eyebrow")}</Eyebrow>
                <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                  {t("related.title")}
                </h2>
              </div>
              <Link
                href="/pergolas"
                className="text-primary hidden text-sm font-medium underline underline-offset-4 md:block"
              >
                {t("related.cta")}
              </Link>
            </div>
            <div className="grid gap-6 md:grid-cols-3">
              {related.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}

function Spec({
  Icon,
  label,
  value,
}: {
  Icon: typeof Ruler;
  label: string;
  value: string;
}) {
  return (
    <div>
      <div className="text-secondary flex items-center gap-2 text-[10px] uppercase tracking-[0.2em]">
        <Icon className="text-accent size-3.5" />
        {label}
      </div>
      <div className="text-primary mt-1.5 text-sm">{value}</div>
    </div>
  );
}
