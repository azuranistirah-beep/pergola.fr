import { AdminHeader } from "@/features/admin/admin-ui";
import { InvoiceForm } from "@/features/admin/invoice-form";
import { getT } from "@/lib/admin-i18n";
import { getSiteInfo } from "@/repositories/settings-repository";

export default async function NewInvoicePage() {
  const [{ t }, site] = await Promise.all([getT(), getSiteInfo()]);
  const now = new Date();
  const due = new Date(now);
  due.setDate(due.getDate() + (site.paymentTermsDays || 0));
  return (
    <>
      <AdminHeader
        title={t("invoices.newTitle")}
        subtitle={t("invoices.newSubtitle")}
      />
      <InvoiceForm
        initial={{
          invoiceNumber: "",
          orderId: null,
          status: "DRAFT",
          customerName: "",
          customerEmail: "",
          customerPhone: "",
          customerAddress: "",
          customerPostal: "",
          customerCity: "",
          customerCountry: "FR",
          issuedAt: now.toISOString(),
          dueAt: due.toISOString(),
          currency: "EUR",
          vatRatePercent: site.vatRatePercent || 20,
          notes: "",
          terms: site.paymentTerms || "",
          footer: site.invoiceFooter || "",
          items: [],
        }}
      />
    </>
  );
}
