import { setRequestLocale } from "next-intl/server";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Wishlist",
  description:
    "Retrouvez ici les pergolas et accessoires que vous avez sauvegardés pour plus tard.",
};

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <>
      <PageHeader
        eyebrow="Espace client"
        title="Ma wishlist"
        intro="Sauvegardez vos coups de cœur, comparez, et retrouvez-les quand vous êtes prêt·e."
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
            <div className="bg-muted text-accent flex size-16 items-center justify-center rounded-full">
              <Heart className="size-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl">Votre wishlist est vide.</h2>
              <p className="text-secondary mt-3 text-sm">
                Cliquez sur le cœur d&apos;une pergola pour la sauvegarder ici.
                Vous pourrez la retrouver et la commander plus tard.
              </p>
            </div>
            <Button asChild variant="primary" size="lg">
              <Link href="/pergolas">Explorer la collection</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
