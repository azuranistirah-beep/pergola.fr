import { AdminHeader } from "@/features/admin/admin-ui";
import { PaymentMethodsManager } from "@/features/admin/payment-methods-manager";
import { listPaymentMethods } from "@/repositories/payment-methods-repository";
import { getT } from "@/lib/admin-i18n";

export default async function PaymentMethodsPage() {
  const [methods, { t }] = await Promise.all([
    listPaymentMethods({ adminOnly: true }),
    getT(),
  ]);
  return (
    <>
      <AdminHeader
        title={t("paymentMethods.title")}
        subtitle={t("paymentMethods.subtitle")}
      />
      <PaymentMethodsManager methods={methods} />
    </>
  );
}
