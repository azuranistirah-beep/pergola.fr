import Link from "next/link";
import { Plus } from "lucide-react";
import {
  AdminButton,
  AdminHeader,
  AdminSection,
} from "@/features/admin/admin-ui";
import { InvoicesTable } from "@/features/admin/invoices-table";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { getT } from "@/lib/admin-i18n";

interface Row {
  id: string;
  invoice_number: string;
  status: string;
  customer_name: string;
  customer_email: string | null;
  issued_at: string;
  due_at: string | null;
  total_ttc_cents: number;
}

async function load() {
  const { data } = await insforgeAdmin.database
    .from("invoices")
    .select(
      "id, invoice_number, status, customer_name, customer_email, issued_at, due_at, total_ttc_cents",
    )
    .order("issued_at", { ascending: false })
    .limit(10000);
  return (data ?? []) as Row[];
}

export default async function InvoicesListPage() {
  const [rows, { t, locale }] = await Promise.all([load(), getT()]);
  const dateLocale = locale === "id" ? "id-ID" : "en-GB";
  return (
    <>
      <AdminHeader
        title={t("invoices.title")}
        subtitle={t("invoices.subtitle", { n: rows.length })}
        actions={
          <Link href="/admin/invoices/new">
            <AdminButton variant="primary">
              <Plus className="size-4" /> {t("invoices.new")}
            </AdminButton>
          </Link>
        }
      />
      <AdminSection>
        <InvoicesTable rows={rows} dateLocale={dateLocale} />
      </AdminSection>
    </>
  );
}
