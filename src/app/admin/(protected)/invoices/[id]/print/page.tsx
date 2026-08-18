import { notFound } from "next/navigation";
import { query, queryOne } from "@/lib/db";
import { formatEUR } from "@/lib/utils";
import { getT, type AdminMessageKey } from "@/lib/admin-i18n";
import { getSiteInfo } from "@/repositories/settings-repository";
import { InvoiceAutoPrint } from "@/features/admin/invoice-auto-print";
import { LogoMark } from "@/components/brand/logo";
import { listPaymentMethods } from "@/repositories/payment-methods-repository";

interface Inv {
  id: string;
  invoice_number: string;
  order_id: string | null;
  status: "DRAFT" | "ISSUED" | "PAID" | "CANCELLED";
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_address: string | null;
  customer_postal: string | null;
  customer_city: string | null;
  customer_country: string | null;
  issued_at: string;
  due_at: string | null;
  paid_at: string | null;
  currency: string;
  vat_rate_percent: number;
  subtotal_ht_cents: number;
  vat_cents: number;
  total_ttc_cents: number;
  notes: string | null;
  terms: string | null;
  footer: string | null;
}

interface Item {
  id: string;
  description: string;
  sku: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
}

async function load(id: string) {
  const [inv, items, site, methods] = await Promise.all([
    queryOne<Inv>("SELECT * FROM invoices WHERE id = ? LIMIT 1", [id]),
    query<Item>(
      "SELECT * FROM invoice_items WHERE invoice_id = ? ORDER BY sort_order ASC",
      [id],
    ),
    getSiteInfo(),
    listPaymentMethods(),
  ]);
  const activeMethods = methods.filter((m) => m.is_active);
  return { inv, items, site, methods: activeMethods };
}

export const metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

export default async function InvoicePrintPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ inv, items, site, methods }, { t, locale }] = await Promise.all([
    load(id),
    getT(),
  ]);
  if (!inv) notFound();

  const dateLocale = locale === "id" ? "id-ID" : "en-GB";
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const isPaid = inv.status === "PAID";

  return (
    <div className="invoice-root">
      <style>{`
        .invoice-root {
          background: #fff;
          color: #111;
          max-width: 210mm;
          margin: 0 auto;
          padding: 18mm 16mm;
          font: 11px/1.55 -apple-system, BlinkMacSystemFont, "Segoe UI", Inter, sans-serif;
        }
        .invoice-root h1 { font-family: "Cormorant Garamond", Georgia, serif; font-size: 30px; margin: 0; letter-spacing: -0.5px; }
        .invoice-root h2 { font-family: "Cormorant Garamond", Georgia, serif; font-size: 15px; margin: 0 0 6px; font-weight: 600; }
        .invoice-root table { width: 100%; border-collapse: collapse; }
        .invoice-root .num { text-align: right; font-variant-numeric: tabular-nums; }
        .invoice-root .label { font-size: 9px; text-transform: uppercase; letter-spacing: 2px; color: #7a7a7a; }
        .invoice-root .stamp {
          display: inline-block;
          padding: 6px 14px;
          border: 2px solid #2d7a3e;
          color: #2d7a3e;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 3px;
          border-radius: 3px;
          transform: rotate(-8deg);
        }
        .invoice-root .stamp.unpaid { border-color: #c8a46b; color: #c8a46b; }
        .invoice-root .stamp.draft { border-color: #999; color: #999; }
        .invoice-root .stamp.cancelled { border-color: #b04040; color: #b04040; }
        .invoice-root .divider { border-top: 2px solid #111; margin: 14px 0; }
        .invoice-root .thin-divider { border-top: 1px solid #eaeaea; margin: 10px 0; }
        .invoice-root .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
        .invoice-root .items th { border-bottom: 1.5px solid #111; padding: 10px 8px; text-align: left; font-size: 9px; text-transform: uppercase; letter-spacing: 2px; }
        .invoice-root .items td { border-bottom: 1px solid #eee; padding: 12px 8px; vertical-align: top; }
        .invoice-root .totals { width: 45%; margin-left: auto; margin-top: 10px; }
        .invoice-root .totals td { padding: 6px 8px; }
        .invoice-root .totals .grand { border-top: 2px solid #111; font-size: 14px; font-weight: 700; }
        .invoice-root .box { border: 1px solid #d0d0d0; border-radius: 6px; padding: 12px 14px; background: #fafafa; }
        .invoice-root .brand { font-family: "Cormorant Garamond", Georgia, serif; font-size: 22px; }
        .invoice-root .brand .dot { color: #c8a46b; }
        .invoice-root .footer-legal { margin-top: 24px; padding-top: 12px; border-top: 1px solid #d0d0d0; font-size: 9px; color: #666; line-height: 1.5; }
        .invoice-root .company-meta { font-size: 9.5px; color: #555; line-height: 1.55; }
        @media print {
          body { background: #fff; }
          aside, header { display: none !important; }
          main { padding: 0 !important; }
          .invoice-root { max-width: none; padding: 12mm; }
        }
      `}</style>
      <InvoiceAutoPrint />

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <div
            className="brand"
            style={{ display: "flex", alignItems: "center", gap: 10, color: "#111" }}
          >
            <LogoMark className="size-6" />
            <span>
              {site.companyName}
              <span className="dot">.</span>
            </span>
          </div>
          <div className="company-meta" style={{ marginTop: 8 }}>
            {site.companyAddress}
            <br />
            {site.email} · {site.phone}
          </div>
        </div>
        <div style={{ textAlign: "right" }}>
          <h1>{t("invoice.title")}</h1>
          <div style={{ marginTop: 8, fontSize: 12 }}>
            <div style={{ fontFamily: "monospace" }}>{inv.invoice_number}</div>
            <div style={{ marginTop: 4, color: "#666" }}>
              {t("invoice.date")}: {fmt(inv.issued_at)}
            </div>
            {inv.due_at && (
              <div style={{ color: "#666" }}>
                {t("invoice.dueDate")}: {fmt(inv.due_at)}
              </div>
            )}
            <div style={{ marginTop: 10 }}>
              <span
                className={
                  "stamp " +
                  (isPaid
                    ? ""
                    : inv.status === "DRAFT"
                      ? "draft"
                      : inv.status === "CANCELLED"
                        ? "cancelled"
                        : "unpaid")
                }
              >
                {t(`invoices.status.${inv.status}` as AdminMessageKey)}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      <div className="grid-2">
        <div>
          <div className="label">{t("invoice.issuedBy")}</div>
          <h2 style={{ marginTop: 6 }}>{site.companyName}</h2>
          <div className="company-meta">
            {site.companyAddress}
            <br />
            {site.companySiret && <>SIRET: {site.companySiret}<br /></>}
            {site.companyRcs && <>{site.companyRcs}<br /></>}
            {site.companyVatNumber && <>TVA: {site.companyVatNumber}<br /></>}
            {site.companyLegalForm && site.companyCapital && (
              <>{site.companyLegalForm} au capital de {site.companyCapital}</>
            )}
          </div>
        </div>
        <div>
          <div className="label">{t("invoice.issuedTo")}</div>
          <h2 style={{ marginTop: 6 }}>{inv.customer_name}</h2>
          <div className="company-meta">
            {inv.customer_email}
            {inv.customer_phone && <><br />{inv.customer_phone}</>}
            {inv.customer_address && (
              <>
                <br /><br />
                {inv.customer_address}
                <br />
                {[inv.customer_postal, inv.customer_city].filter(Boolean).join(" ")}
                <br />
                {inv.customer_country}
              </>
            )}
          </div>
        </div>
      </div>

      <table className="items" style={{ marginTop: 24 }}>
        <thead>
          <tr>
            <th>{t("invoice.description")}</th>
            <th className="num" style={{ width: "10%" }}>{t("invoice.qty")}</th>
            <th className="num" style={{ width: "18%" }}>{t("invoice.unitPrice")}</th>
            <th className="num" style={{ width: "18%" }}>{t("invoice.amount")}</th>
          </tr>
        </thead>
        <tbody>
          {items.map((it) => (
            <tr key={it.id}>
              <td>
                <div style={{ fontWeight: 500 }}>{it.description}</div>
                {it.sku && (
                  <div style={{ fontSize: 9, color: "#888", fontFamily: "monospace", marginTop: 2 }}>
                    SKU · {it.sku}
                  </div>
                )}
              </td>
              <td className="num">{it.quantity}</td>
              <td className="num">{formatEUR(it.unit_price_cents)}</td>
              <td className="num">{formatEUR(it.line_total_cents)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <table className="totals">
        <tbody>
          <tr>
            <td>{t("invoice.subtotalHt")}</td>
            <td className="num">{formatEUR(inv.subtotal_ht_cents)}</td>
          </tr>
          <tr>
            <td>{t("invoice.vat")} ({inv.vat_rate_percent}%)</td>
            <td className="num">{formatEUR(inv.vat_cents)}</td>
          </tr>
          <tr className="grand">
            <td>{t("invoice.totalTtc")}</td>
            <td className="num">{formatEUR(inv.total_ttc_cents)}</td>
          </tr>
        </tbody>
      </table>

      <div className="thin-divider" style={{ marginTop: 20 }} />

      <div className="grid-2" style={{ marginTop: 12 }}>
        <div>
          {inv.terms && (
            <>
              <div className="label">{t("invoice.paymentTerms")}</div>
              <p style={{ marginTop: 6, fontSize: 10.5 }}>{inv.terms}</p>
            </>
          )}
        </div>
        {methods.length > 0 ? (
          <div className="box">
            <div className="label">{t("invoice.bankTransfer")}</div>
            <div style={{ marginTop: 6, fontSize: 10.5, lineHeight: 1.7 }}>
              {methods.map((m, i) => (
                <div
                  key={m.id}
                  style={{
                    marginTop: i > 0 ? 10 : 0,
                    paddingTop: i > 0 ? 8 : 0,
                    borderTop: i > 0 ? "1px dashed #ccc" : undefined,
                  }}
                >
                  {m.bank_name && (
                    <div>
                      <strong>{m.bank_name}</strong>
                    </div>
                  )}
                  {m.holder && (
                    <div style={{ color: "#555" }}>{m.holder}</div>
                  )}
                  {m.iban && (
                    <div style={{ fontFamily: "monospace" }}>
                      {t("invoice.iban")}: {m.iban}
                    </div>
                  )}
                  {m.bic && (
                    <div style={{ fontFamily: "monospace" }}>
                      {t("invoice.bic")}: {m.bic}
                    </div>
                  )}
                  {m.notes && (
                    <div style={{ marginTop: 4, color: "#555", fontSize: 9.5 }}>
                      {m.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (site.bankIban || site.bankName) ? (
          <div className="box">
            <div className="label">{t("invoice.bankTransfer")}</div>
            <div style={{ marginTop: 6, fontSize: 10.5, lineHeight: 1.7 }}>
              {site.bankName && <div><strong>{site.bankName}</strong></div>}
              {site.bankIban && (
                <div style={{ fontFamily: "monospace" }}>
                  {t("invoice.iban")}: {site.bankIban}
                </div>
              )}
              {site.bankBic && (
                <div style={{ fontFamily: "monospace" }}>
                  {t("invoice.bic")}: {site.bankBic}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </div>

      {inv.footer && (
        <div className="footer-legal">
          <div className="label" style={{ marginBottom: 4 }}>
            {t("invoice.legalNote")}
          </div>
          {inv.footer}
        </div>
      )}

      <div style={{ marginTop: 18, textAlign: "center", fontSize: 10, color: "#888" }}>
        {t("invoice.thanks")} · {site.email}
      </div>
    </div>
  );
}
