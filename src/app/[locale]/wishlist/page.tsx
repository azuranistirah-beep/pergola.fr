import { setRequestLocale, getTranslations } from "next-intl/server";
import { Heart } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { PageHeader } from "@/components/layout/page-header";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";

export default async function WishlistPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("wishlistPage");
  return (
    <>
      <PageHeader
        eyebrow={t("eyebrow")}
        title={t("title")}
        intro={t("intro")}
      />

      <section className="py-16 md:py-24">
        <Container>
          <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
            <div className="bg-muted text-accent flex size-16 items-center justify-center rounded-full">
              <Heart className="size-6" />
            </div>
            <div>
              <h2 className="font-serif text-2xl">{t("empty")}</h2>
              <p className="text-secondary mt-3 text-sm">{t("emptyBody")}</p>
            </div>
            <Button asChild variant="primary" size="lg">
              <Link href="/pergolas">{t("explore")}</Link>
            </Button>
          </div>
        </Container>
      </section>
    </>
  );
}
