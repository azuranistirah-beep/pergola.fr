import { ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { ProductCard } from "@/features/products/product-card";
import { listProducts } from "@/repositories/product-repository";

export default async function NotFound() {
  const catalog = await listProducts().catch(() => []);
  const featured = catalog.filter((p) => p.featured).slice(0, 3);

  return (
    <>
      <div className="relative flex min-h-[70vh] items-center overflow-hidden pt-24">
        <div
          aria-hidden
          className="absolute inset-0 -z-10"
          style={{
            background:
              "radial-gradient(60% 60% at 50% 30%, rgba(200,164,107,0.25) 0%, rgba(17,17,17,0) 60%), linear-gradient(180deg, #14100b 0%, #0f0d0a 100%)",
          }}
        />
        <Container className="text-white">
          <Eyebrow className="text-accent">Erreur 404</Eyebrow>
          <h1 className="mt-4 max-w-3xl font-serif text-6xl leading-tight md:text-8xl">
            Cette page a filé
            <br /> au grand air.
          </h1>
          <p className="mt-8 max-w-lg text-white/70">
            La page que vous cherchez n&apos;existe pas ou a été déplacée.
            Revenez à l&apos;accueil ou explorez nos coups de cœur ci-dessous.
          </p>
          <div className="mt-10 flex flex-col gap-3 sm:flex-row">
            <Button asChild variant="accent" size="lg">
              <Link href="/">
                Retour à l&apos;accueil <ArrowRight />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="border-white/30 bg-transparent text-white hover:border-white hover:bg-white hover:text-primary"
            >
              <Link href="/pergolas">Voir la collection</Link>
            </Button>
          </div>
        </Container>
      </div>

      {featured.length > 0 && (
        <section className="py-24 md:py-32">
          <Container>
            <Eyebrow>Nos coups de cœur</Eyebrow>
            <h2 className="mt-4 font-serif text-3xl leading-tight md:text-4xl">
              Peut-être cherchiez-vous ça.
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {featured.map((p) => (
                <ProductCard key={p.slug} product={p} />
              ))}
            </div>
          </Container>
        </section>
      )}
    </>
  );
}
