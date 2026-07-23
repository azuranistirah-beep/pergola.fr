import { notFound } from "next/navigation";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { formatEUR } from "@/lib/utils";
import { getT } from "@/lib/admin-i18n";
import { getSiteInfo } from "@/repositories/settings-repository";
import { ensureInvoiceNumber } from "@/actions/admin-orders-actions";
import { InvoiceAutoPrint } from "@/features/admin/invoice-auto-print";
import { LogoMark } from "@/components/brand/logo";
import { listPaymentMethods } from "@/repositories/payment-methods-repository";

interface OrderRow {
  id: string;
  order_number: string;
  customer_name: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  shipping_address: string | null;
  shipping_postal: string | null;
  shipping_city: string | null;
  shipping_country: string | null;
  status: string;
  total_cents: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
  invoice_number: string | null;
  invoice_issued_at: string | null;
}

interface ItemRow {
  id: string;
  product_name: string;
  product_sku: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
}

async function load(id: string) {
  const [orderRes, itemsRes, site, methods] = await Promise.all([
    insforgeAdmin.database.from("orders").select("*").eq("id", id).limit(1),
    insforgeAdmin.database
      .from("order_items")
      .select("*")
      .eq("order_id", id)
      .order("created_at", { ascending: true }),
    getSiteInfo(),
    listPaymentMethods({ adminOnly: true }),
  ]);
  const order = ((orderRes.data ?? [])[0] ?? null) as OrderRow | null;
  const items = (itemsRes.data ?? []) as ItemRow[];
  const activeMethods = methods.filter((m) => m.is_active);
  return { order, items, site, methods: activeMethods };
}

export const metadata = {
  title: "Invoice",
  robots: { index: false, follow: false },
};

const PAID_STATUSES = new Set(["PAID", "PROCESSING", "SHIPPED", "DELIVERED"]);

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ order, items, site, methods }, { t, locale }] = await Promise.all([
    load(id),
    getT(),
  ]);
  if (!order) notFound();

  const { invoiceNumber, issuedAt } = await ensureInvoiceNumber(
    order.id,
    site.invoicePrefix || "INV",
  );

  const dateLocale = locale === "id" ? "id-ID" : "en-GB";
  const fmt = (iso: string) =>
    new Date(iso).toLocaleDateString(dateLocale, {
      day: "numeric",
      month: "long",
      year: "numeric",
    });

  const issued = new Date(issuedAt);
  const due = new Date(issued);
  due.setDate(due.getDate() + (site.paymentTermsDays || 0));

  const vatRate = Number(site.vatRatePercent || 0);
  const totalTtc = order.total_cents;
  const totalHt = Math.round(totalTtc / (1 + vatRate / 100));
  const vatAmount = totalTtc - totalHt;

  const isPaid = PAID_STATUSES.has(order.status);

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
        .invoice-root .divider { border-top: 2px solid #111; margin: 14px 0; }
        .invoice-root .thin-divider { border-top: 1px solid #eaeaea; margin: 10px 0; }
        .invoice-root .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 28px; }
        .invoice-root .grid-3 { display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 24px; }
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

      {/* Header */}
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
            <div style={{ fontFamily: "monospace" }}>{invoiceNumber}</div>
            <div style={{ marginTop: 4, color: "#666" }}>
              {t("invoice.date")}: {fmt(issuedAt)}
            </div>
            <div style={{ color: "#666" }}>
              {t("invoice.dueDate")}: {fmt(due.toISOString())}
            </div>
            <div style={{ marginTop: 10 }}>
              <span className={"stamp " + (isPaid ? "" : "unpaid")}>
                {isPaid ? t("invoice.status.paid") : t("invoice.status.unpaid")}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="divider" />

      {/* Parties */}
      <div className="grid-2">
        <div>
          <div className="label">{t("invoice.issuedBy")}</div>
          <h2 style={{ marginTop: 6 }}>{site.companyName}</h2>
          <div className="company-meta">
            {site.companyAddress}
            <br />
            {site.companySiret && (
              <>
                SIRET: {site.companySiret}
                <br />
              </>
            )}
            {site.companyRcs && (
              <>
                {site.companyRcs}
                <br />
              </>
            )}
            {site.companyVatNumber && (
              <>
                TVA: {site.companyVatNumber}
                <br />
              </>
            )}
            {site.companyLegalForm && site.companyCapital && (
              <>
                {site.companyLegalForm} au capital de {site.companyCapital}
              </>
            )}
          </div>
        </div>
        <div>
          <div className="label">{t("invoice.issuedTo")}</div>
          <h2 style={{ marginTop: 6 }}>{order.customer_name || "—"}</h2>
          <div className="company-meta">
            {order.customer_email}
            {order.customer_phone && (
              <>
                <br />
                {order.customer_phone}
              </>
            )}
            {order.shipping_address && (
              <>
                <br />
                <br />
                {order.shipping_address}
                <br />
                {[order.shipping_postal, order.shipping_city]
                  .filter(Boolean)
                  .join(" ")}
                <br />
                {order.shipping_country}
              </>
            )}
            <br />
            <br />
            <span className="label">{t("invoice.orderRef")}</span>
            <br />
            <span style={{ fontFamily: "monospace" }}>{order.order_number}</span>
          </div>
        </div>
      </div>

      {/* Line items */}
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
          {items.map((it) => {
            const unitHt = Math.round(it.unit_price_cents / (1 + vatRate / 100));
            const lineHt = Math.round(it.line_total_cents / (1 + vatRate / 100));
            return (
              <tr key={it.id}>
                <td>
                  <div style={{ fontWeight: 500 }}>{it.product_name}</div>
                  {it.product_sku && (
                    <div style={{ fontSize: 9, color: "#888", fontFamily: "monospace", marginTop: 2 }}>
                      SKU · {it.product_sku}
                    </div>
                  )}
                </td>
                <td className="num">{it.quantity}</td>
                <td className="num">{formatEUR(unitHt)}</td>
                <td className="num">{formatEUR(lineHt)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Totals */}
      <table className="totals">
        <tbody>
          <tr>
            <td>{t("invoice.subtotalHt")}</td>
            <td className="num">{formatEUR(totalHt)}</td>
          </tr>
          <tr>
            <td>
              {t("invoice.vat")} ({vatRate}%)
            </td>
            <td className="num">{formatEUR(vatAmount)}</td>
          </tr>
          <tr className="grand">
            <td>{t("invoice.totalTtc")}</td>
            <td className="num">{formatEUR(totalTtc)}</td>
          </tr>
        </tbody>
      </table>

      <div className="thin-divider" style={{ marginTop: 20 }} />

      {/* Payment / bank */}
      <div className="grid-2" style={{ marginTop: 12 }}>
        <div>
          <div className="label">{t("invoice.paymentTerms")}</div>
          <p style={{ marginTop: 6, fontSize: 10.5 }}>{site.paymentTerms}</p>
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
              {site.bankName && (
                <div>
                  <strong>{site.bankName}</strong>
                </div>
              )}
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

      {/* Legal footer */}
      {site.invoiceFooter && (
        <div className="footer-legal">
          <div className="label" style={{ marginBottom: 4 }}>
            {t("invoice.legalNote")}
          </div>
          {site.invoiceFooter}
        </div>
      )}

      <div style={{ marginTop: 18, textAlign: "center", fontSize: 10, color: "#888" }}>
        {t("invoice.thanks")} · {site.email}
      </div>
    </div>
  );
}
