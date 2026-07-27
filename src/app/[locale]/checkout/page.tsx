import { setRequestLocale } from "next-intl/server";
import { CheckoutForm } from "./checkout-form";
import { listActivePaymentMethodsForCustomer } from "@/repositories/payment-methods-repository";

export const metadata = {
  robots: { index: false, follow: false },
};

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const paymentMethods = await listActivePaymentMethodsForCustomer();
  return <CheckoutForm paymentMethods={paymentMethods} />;
}
