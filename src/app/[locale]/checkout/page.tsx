import { redirect } from "next/navigation";

export const metadata = { robots: { index: false, follow: false } };

export default async function CheckoutRedirect({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  redirect(`/${locale}/contact?intent=checkout`);
}
