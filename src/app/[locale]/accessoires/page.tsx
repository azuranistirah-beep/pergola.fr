import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/features/coming-soon/coming-soon";

export const metadata = {
  title: "Accessories",
  description: "Accessories collection — bientôt disponible / coming soon.",
};

export default async function AccessoiresPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      slug="accessories"
      gradient="linear-gradient(150deg, #4d4335 0%, #a17a4b 55%, #c8a46b 100%)"
    />
  );
}
