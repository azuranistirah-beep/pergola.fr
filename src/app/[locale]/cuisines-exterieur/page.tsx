import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/features/coming-soon/coming-soon";

export const metadata = {
  title: "Outdoor kitchens",
  description: "Outdoor kitchens collection — bientôt disponible / coming soon.",
};

export default async function CuisinesPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      slug="kitchens"
      gradient="linear-gradient(140deg, #2b1f16 0%, #58402b 55%, #c8a46b 110%)"
    />
  );
}
