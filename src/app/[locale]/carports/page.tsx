import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/features/coming-soon/coming-soon";

export const metadata = {
  title: "Carports",
  description: "Carport collection — bientôt disponible / coming soon.",
};

export default async function CarportsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      slug="carports"
      gradient="linear-gradient(160deg, #1e1e1e 0%, #3a3a3a 60%, #5a5a5a 100%)"
    />
  );
}
