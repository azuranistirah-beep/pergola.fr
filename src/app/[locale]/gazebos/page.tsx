import { setRequestLocale } from "next-intl/server";
import { ComingSoon } from "@/features/coming-soon/coming-soon";

export const metadata = {
  title: "Gazebos",
  description: "New gazebo collection — bientôt disponible / coming soon.",
};

export default async function GazebosPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return (
    <ComingSoon
      slug="gazebos"
      gradient="linear-gradient(150deg, #3b2a1a 0%, #6a4a2c 55%, #a17a4b 100%)"
    />
  );
}
