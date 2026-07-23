"use client";

import * as React from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Copy, Search, Trash2, Upload, Download, Archive } from "lucide-react";
import { AdminButton } from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import {
  bulkDeleteProducts,
  bulkSetProductStatus,
  duplicateProductAndRedirect,
} from "@/actions/admin-actions";
import { formatEUR } from "@/lib/utils";
import type { AdminMessageKey } from "@/lib/admin-i18n";

interface Row {
  id: string;
  slug: string;
  sku: string;
  status: string;
  base_price_cents: number;
  is_featured: boolean;
  categorySlug: string;
  name: string;
}

const statusTone: Record<string, string> = {
  PUBLISHED: "bg-accent/15 text-accent",
  DRAFT: "bg-muted text-secondary",
  ARCHIVED: "bg-muted text-secondary",
};

export function ProductsTable({ products }: { products: Row[] }) {
  const { t } = useAdminT();
  const [query, setQuery] = React.useState("");
  const [selected, setSelected] = React.useState<Set<string>>(new Set());
  const [pending, setPending] = React.useState(false);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.slug.toLowerCase().includes(q) ||
        p.sku.toLowerCase().includes(q) ||
        p.categorySlug.toLowerCase().includes(q),
    );
  }, [query, products]);

  const allSelected =
    filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const someSelected = filtered.some((p) => selected.has(p.id));

  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allSelected) filtered.forEach((p) => next.delete(p.id));
      else filtered.forEach((p) => next.add(p.id));
      return next;
    });
  };
  const toggleOne = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };
  const clear = () => setSelected(new Set());

  const bulk = async (
    fn: () => Promise<number>,
    successKey: AdminMessageKey,
    confirmMsg?: string,
  ) => {
    if (confirmMsg && !confirm(confirmMsg)) return;
    setPending(true);
    try {
      const n = await fn();
      toast.success(t(successKey, { n, s: n > 1 ? "s" : "" }));
      clear();
    } catch (e) {
      toast.error(t("common.error"), {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setPending(false);
    }
  };

  const ids = () => Array.from(selected);
  const publish = () =>
    bulk(() => bulkSetProductStatus(ids(), "PUBLISHED"), "products.bulk.done");
  const unpublish = () =>
    bulk(() => bulkSetProductStatus(ids(), "DRAFT"), "products.bulk.done");
  const archive = () =>
    bulk(() => bulkSetProductStatus(ids(), "ARCHIVED"), "products.bulk.done");
  const remove = () =>
    bulk(
      () => bulkDeleteProducts(ids()),
      "products.bulk.done",
      t("products.bulk.deleteConfirm", { n: selected.size, s: selected.size > 1 ? "s" : "" }),
    );

  const duplicate = async (id: string) => {
    setPending(true);
    try {
      await duplicateProductAndRedirect(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (!msg.includes("NEXT_REDIRECT")) {
        toast.error(t("common.error"), { description: msg });
        setPending(false);
      }
    }
  };

  return (
    <div className="bg-background border-border/60 rounded-3xl border">
      <div className="border-border/60 flex flex-wrap items-center gap-3 border-b px-6 py-4">
        <Search className="text-secondary size-4 shrink-0" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t("products.searchPlaceholder")}
          className="flex-1 bg-transparent text-sm outline-none placeholder:text-secondary/50"
        />
        {selected.size > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-secondary text-xs">
              {t("products.selected", { n: selected.size })}
            </span>
            <AdminButton
              type="button"
              variant="outline"
              onClick={publish}
              disabled={pending}
            >
              <Upload className="size-3.5" /> {t("products.bulk.publish")}
            </AdminButton>
            <AdminButton
              type="button"
              variant="outline"
              onClick={unpublish}
              disabled={pending}
            >
              <Download className="size-3.5" /> {t("products.bulk.unpublish")}
            </AdminButton>
            <AdminButton
              type="button"
              variant="outline"
              onClick={archive}
              disabled={pending}
            >
              <Archive className="size-3.5" /> {t("products.bulk.archive")}
            </AdminButton>
            <AdminButton
              type="button"
              variant="danger"
              onClick={remove}
              disabled={pending}
            >
              <Trash2 className="size-3.5" /> {t("products.bulk.delete")}
            </AdminButton>
            <button
              type="button"
              onClick={clear}
              className="text-secondary hover:text-primary text-xs underline"
            >
              {t("products.clearSelection")}
            </button>
          </div>
        )}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="border-border/60 border-b text-left">
            <tr className="text-secondary [&_th]:px-4 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
              <th className="w-10">
                <input
                  type="checkbox"
                  checked={allSelected}
                  ref={(el) => {
                    if (el) el.indeterminate = !allSelected && someSelected;
                  }}
                  onChange={toggleAll}
                  className="accent-primary"
                />
              </th>
              <th>{t("products.table.name")}</th>
              <th>{t("products.table.sku")}</th>
              <th>{t("products.table.category")}</th>
              <th className="text-right">{t("products.table.price")}</th>
              <th>{t("common.status")}</th>
              <th className="w-32 text-right">{t("common.actions")}</th>
            </tr>
          </thead>
          <tbody className="divide-border/60 divide-y">
            {filtered.map((p) => {
              const isSel = selected.has(p.id);
              const statusKey = `products.status.${p.status}` as
                | "products.status.PUBLISHED"
                | "products.status.DRAFT"
                | "products.status.ARCHIVED";
              return (
                <tr
                  key={p.id}
                  className={isSel ? "bg-accent/5" : "hover:bg-muted/40"}
                >
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      checked={isSel}
                      onChange={() => toggleOne(p.id)}
                      className="accent-primary"
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="text-primary font-medium">{p.name}</div>
                    <div className="text-secondary text-xs">/{p.slug}</div>
                  </td>
                  <td className="text-secondary px-4 py-3 font-mono text-xs">
                    {p.sku}
                  </td>
                  <td className="text-secondary px-4 py-3 text-xs">
                    {p.categorySlug}
                  </td>
                  <td className="px-4 py-3 text-right font-mono">
                    {formatEUR(p.base_price_cents)}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] ${statusTone[p.status] ?? ""}`}
                    >
                      {t(statusKey)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        type="button"
                        onClick={() => duplicate(p.id)}
                        disabled={pending}
                        title={t("products.duplicate")}
                        className="text-secondary hover:text-primary inline-flex"
                      >
                        <Copy className="size-3.5" />
                      </button>
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-primary text-xs underline underline-offset-4"
                      >
                        {t("common.edit")}
                      </Link>
                    </div>
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr>
                <td
                  colSpan={7}
                  className="text-secondary p-12 text-center text-sm"
                >
                  {query ? "—" : t("products.empty")}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
