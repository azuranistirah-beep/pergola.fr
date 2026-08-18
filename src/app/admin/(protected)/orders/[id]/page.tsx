import Link from "next/link";
import { notFound } from "next/navigation";
import { Receipt } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminHeader,
  AdminSection,
} from "@/features/admin/admin-ui";
import { OrderStatusSelect } from "@/features/admin/order-status-select";
import { OrderDeleteButton } from "@/features/admin/order-delete-button";
import { query, queryOne } from "@/lib/db";
import { formatEUR } from "@/lib/utils";
import { getT } from "@/lib/admin-i18n";
import { generateInvoiceFromOrderAndRedirect } from "@/actions/admin-invoices-actions";

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
  notes: string | null;
  status: string;
  total_cents: number;
  items_count: number;
  currency: string;
  created_at: string;
  paid_at: string | null;
  shipped_at: string | null;
  delivered_at: string | null;
}

interface ItemRow {
  id: string;
  product_name: string;
  product_slug: string | null;
  product_sku: string | null;
  unit_price_cents: number;
  quantity: number;
  line_total_cents: number;
}

async function load(id: string) {
  const [order, items] = await Promise.all([
    queryOne<OrderRow>("SELECT * FROM orders WHERE id = ? LIMIT 1", [id]),
    query<ItemRow>(
      "SELECT * FROM order_items WHERE order_id = ? ORDER BY created_at ASC",
      [id],
    ),
  ]);
  return { order, items };
}

function fmtDate(iso: string | null | undefined, locale: string) {
  if (!iso) return null;
  return new Date(iso).toLocaleString(locale, {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [{ order, items }, { t, locale }] = await Promise.all([
    load(id),
    getT(),
  ]);
  if (!order) notFound();
  const dateLocale = locale === "id" ? "id-ID" : "en-GB";

  return (
    <>
      <AdminHeader
        title={order.customer_name || order.order_number}
        subtitle={t("orderDetail.subtitle", {
          n: order.order_number,
          date: fmtDate(order.created_at, dateLocale) ?? "",
        })}
        actions={
          <div className="flex items-center gap-2">
            <OrderStatusSelect id={order.id} current={order.status} />
            <form action={generateInvoiceFromOrderAndRedirect.bind(null, order.id)}>
              <AdminButton type="submit" variant="outline">
                <Receipt className="size-3.5" /> {t("invoices.generateFromOrder")}
              </AdminButton>
            </form>
            <OrderDeleteButton id={order.id} />
          </div>
        }
      />

      <AdminSection>
        <div className="mb-4">
          <Link
            href="/admin/orders"
            className="text-secondary hover:text-primary text-xs"
          >
            {t("orderDetail.back")}
          </Link>
        </div>

        <div className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <div className="space-y-6">
            <AdminCard>
              <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                {t("orderDetail.customer")}
              </div>
              <div className="mt-3 space-y-1 text-sm">
                <div className="text-primary font-medium">
                  {order.customer_name || "—"}
                </div>
                <div>
                  <a
                    className="hover:text-primary"
                    href={`mailto:${order.customer_email}`}
                  >
                    {order.customer_email || "—"}
                  </a>
                </div>
                <div className="text-secondary">
                  {order.customer_phone ?? t("orderDetail.notProvided")}
                </div>
              </div>
            </AdminCard>

            <AdminCard>
              <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                {t("orderDetail.shipping")}
              </div>
              <div className="text-primary mt-3 text-sm">
                {order.shipping_address ? (
                  <>
                    <div>{order.shipping_address}</div>
                    <div>
                      {[order.shipping_postal, order.shipping_city]
                        .filter(Boolean)
                        .join(" ")}
                    </div>
                    <div className="text-secondary">
                      {order.shipping_country}
                    </div>
                  </>
                ) : (
                  <span className="text-secondary">
                    {t("orderDetail.notProvided")}
                  </span>
                )}
              </div>
            </AdminCard>

            {order.notes && (
              <AdminCard>
                <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                  {t("orderDetail.notes")}
                </div>
                <p className="text-primary mt-3 whitespace-pre-wrap text-sm">
                  {order.notes}
                </p>
              </AdminCard>
            )}

            <AdminCard className="p-0">
              <div className="border-border/60 border-b p-6">
                <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                  {t("orderDetail.items")}
                </div>
              </div>
              <table className="w-full text-sm">
                <thead className="border-border/60 border-b text-left">
                  <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                    <th>{t("products.table.name")}</th>
                    <th className="text-right">{t("orderDetail.unitPrice")}</th>
                    <th className="text-right">{t("orderDetail.qty")}</th>
                    <th className="text-right">{t("orderDetail.lineTotal")}</th>
                  </tr>
                </thead>
                <tbody className="divide-border/60 divide-y">
                  {items.map((it) => (
                    <tr key={it.id}>
                      <td className="px-6 py-4">
                        <div className="text-primary font-medium">
                          {it.product_name}
                        </div>
                        {it.product_sku && (
                          <div className="text-secondary font-mono text-xs">
                            {it.product_sku}
                          </div>
                        )}
                      </td>
                      <td className="text-right px-6 py-4 font-mono">
                        {formatEUR(it.unit_price_cents)}
                      </td>
                      <td className="text-right px-6 py-4 font-mono">
                        {it.quantity}
                      </td>
                      <td className="text-right px-6 py-4 font-mono">
                        {formatEUR(it.line_total_cents)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </AdminCard>
          </div>

          <div className="space-y-6">
            <AdminCard>
              <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                {t("orderDetail.summary")}
              </div>
              <dl className="mt-4 space-y-2 text-sm">
                <div className="flex justify-between">
                  <dt className="text-secondary">
                    {t("orderDetail.itemsCount")}
                  </dt>
                  <dd className="font-mono">{order.items_count}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-secondary">
                    {t("orderDetail.currency")}
                  </dt>
                  <dd className="font-mono">{order.currency}</dd>
                </div>
                <div className="border-border/60 mt-3 flex justify-between border-t pt-3 text-base">
                  <dt className="text-primary font-medium">
                    {t("orderDetail.grandTotal")}
                  </dt>
                  <dd className="font-mono">
                    {formatEUR(order.total_cents)}
                  </dd>
                </div>
              </dl>
            </AdminCard>

            <AdminCard>
              <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                {t("orderDetail.timeline")}
              </div>
              <ul className="text-primary mt-4 space-y-3 text-sm">
                <li className="flex justify-between gap-4">
                  <span className="text-secondary">
                    {t("orderDetail.createdAt")}
                  </span>
                  <span>{fmtDate(order.created_at, dateLocale)}</span>
                </li>
                {order.paid_at && (
                  <li className="flex justify-between gap-4">
                    <span className="text-secondary">
                      {t("orderDetail.paidAt")}
                    </span>
                    <span>{fmtDate(order.paid_at, dateLocale)}</span>
                  </li>
                )}
                {order.shipped_at && (
                  <li className="flex justify-between gap-4">
                    <span className="text-secondary">
                      {t("orderDetail.shippedAt")}
                    </span>
                    <span>{fmtDate(order.shipped_at, dateLocale)}</span>
                  </li>
                )}
                {order.delivered_at && (
                  <li className="flex justify-between gap-4">
                    <span className="text-secondary">
                      {t("orderDetail.deliveredAt")}
                    </span>
                    <span>{fmtDate(order.delivered_at, dateLocale)}</span>
                  </li>
                )}
              </ul>
            </AdminCard>
          </div>
        </div>
      </AdminSection>
    </>
  );
}
