import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
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
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) return {};
  return {
    title: product.name,
    description: product.tagline,
  };
}

const materialLabel = {
  wood: "Cèdre massif certifié",
  steel: "Acier galvanisé thermolaqué",
  aluminium: "Aluminium extrudé",
} as const;

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

  return (
    <>
      {/* Breadcrumb */}
      <Container className="pt-28 md:pt-32">
        <nav className="text-secondary flex items-center gap-2 text-xs">
          <Link href="/" className="hover:text-primary">
            Accueil
          </Link>
          <ChevronRight className="size-3" />
          <Link href="/pergolas" className="hover:text-primary">
            Pergolas
          </Link>
          <ChevronRight className="size-3" />
          <span className="text-primary">{product.name}</span>
        </nav>
      </Container>

      {/* Hero: gallery + purchase card */}
      <section className="pt-8 pb-24 md:pt-12 md:pb-32">
        <Container>
          <div className="grid gap-12 lg:grid-cols-[1.3fr_1fr]">
            <ProductGallery product={product} />

            <div className="lg:sticky lg:top-32 lg:self-start">
              <Eyebrow>{materialLabel[product.material]}</Eyebrow>
              <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
                {product.name}
              </h1>
              <p className="text-secondary mt-4 text-base">{product.tagline}</p>

              <div className="border-border mt-8 border-t border-b py-6">
                <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                  Prix TTC — livraison France offerte
                </div>
                <div className="mt-2 flex items-baseline gap-4">
                  <span className="font-serif text-4xl">
                    {formatEUR(product.priceCents)}
                  </span>
                  <span className="text-secondary text-xs">
                    ou 3× {formatEUR(Math.round(product.priceCents / 3))} sans
                    frais
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4 text-sm">
                <Spec
                  Icon={Ruler}
                  label="Dimensions"
                  value={`${product.widthFt}′ × ${product.lengthFt}′ (${(product.widthCm / 100).toFixed(2)}×${(product.lengthCm / 100).toFixed(2)} m)`}
                />
                <Spec Icon={Palette} label="Finition" value={product.finish ?? "Cèdre naturel"} />
                <Spec Icon={ShieldCheck} label="Garantie" value="10 ans" />
                <Spec Icon={Truck} label="Livraison" value="4–6 semaines" />
              </div>

              <div className="mt-8 flex flex-col gap-3">
                <Button asChild variant="primary" size="lg" className="w-full">
                  <Link href={`/configurateur?produit=${product.slug}`}>
                    Configurer & commander
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="w-full">
                  <Link href="/contact">Demander un devis personnalisé</Link>
                </Button>
              </div>

              <ul className="text-secondary mt-8 space-y-2 text-sm">
                {[
                  "Fabrication sur commande dans notre atelier de Vendée",
                  "Pose par nos équipes ou en autonomie (notice détaillée)",
                  "Paiement sécurisé Stripe & PayPal",
                ].map((s) => (
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

      {/* Specifications */}
      <section className="bg-muted py-24 md:py-32">
        <Container>
          <div className="grid gap-16 lg:grid-cols-[1fr_2fr]">
            <div>
              <Eyebrow>Caractéristiques</Eyebrow>
              <h2 className="mt-4 font-serif text-4xl leading-tight">
                Pensée pour durer.
              </h2>
              <p className="text-secondary mt-6 text-sm">
                Chaque composant est sélectionné pour offrir la meilleure
                longévité en climat maritime, alpin ou méditerranéen.
              </p>
            </div>
            <dl className="border-border grid gap-px bg-border overflow-hidden rounded-[var(--radius-lg)]">
              {[
                ["SKU", product.sku],
                ["Matériau", materialLabel[product.material]],
                ["Structure", `Poteaux ${product.material === "wood" ? "cèdre 145 mm" : "acier 100 mm"}`],
                ["Toit", product.family === "sarasota" || product.family === "evanston" ? "Lames orientables à 160°" : product.family === "brendan" || product.family === "windham" ? "Voile d'ombrage tissée" : "Chevrons ajourés"],
                ["Emprise au sol", `${(product.widthCm / 100).toFixed(2)} × ${(product.lengthCm / 100).toFixed(2)} m`],
                ["Fixation", "Platines sol et sabots en acier"],
                ["Résistance vent", "Jusqu'à 160 km/h (essais soufflerie)"],
                ["Origine", "Fabriqué en France"],
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

      {/* Included in the box */}
      <section className="py-24 md:py-32">
        <Container>
          <div className="mx-auto max-w-3xl text-center">
            <Eyebrow>Livré chez vous</Eyebrow>
            <h2 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
              Tout est inclus.
            </h2>
          </div>
          <div className="mt-16 grid gap-6 md:grid-cols-3">
            {[
              { Icon: Wrench, title: "Kit prêt à poser", body: "Toutes les pièces pré-percées et étiquetées, visserie inox fournie." },
              { Icon: Ruler, title: "Notice détaillée", body: "Guide de pose illustré + accès vidéo YouTube pas-à-pas." },
              { Icon: ShieldCheck, title: "Garantie 10 ans", body: "Structure porteuse, finitions et motorisations couvertes." },
            ].map(({ Icon, title, body }) => (
              <div key={title} className="bg-muted rounded-[var(--radius-lg)] p-8">
                <Icon className="text-accent size-6" />
                <h3 className="mt-6 font-serif text-xl">{title}</h3>
                <p className="text-secondary mt-3 text-sm">{body}</p>
              </div>
            ))}
          </div>
        </Container>
      </section>

      <ProductDownloads />
      <ProductReviews />

      {/* Related */}
      {related.length > 0 && (
        <section className="pb-24 md:pb-32">
          <Container>
            <div className="mb-12 flex items-end justify-between">
              <div>
                <Eyebrow>Vous aimerez aussi</Eyebrow>
                <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
                  Dans le même esprit
                </h2>
              </div>
              <Link
                href="/pergolas"
                className="text-primary hidden text-sm font-medium underline underline-offset-4 md:block"
              >
                Voir toute la collection
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
