import Link from "next/link";
import { Plus } from "lucide-react";
import {
  AdminButton,
  AdminHeader,
  AdminSection,
} from "@/features/admin/admin-ui";
import { query } from "@/lib/db";
import { getT } from "@/lib/admin-i18n";

interface CategoryRow {
  id: string;
  slug: string;
  sort_order: number;
  is_featured: number;
}

async function load() {
  const [cats, tr, products] = await Promise.all([
    query<CategoryRow>(
      "SELECT id, slug, sort_order, is_featured FROM categories ORDER BY sort_order ASC",
    ),
    query<{ category_id: string; name: string }>(
      "SELECT category_id, name FROM category_translations WHERE locale = ?",
      ["fr"],
    ),
    query<{ category_id: string }>("SELECT category_id FROM products"),
  ]);
  const name = new Map<string, string>();
  tr.forEach((r) => name.set(r.category_id, r.name));
  const count = new Map<string, number>();
  products.forEach((p) => {
    count.set(p.category_id, (count.get(p.category_id) ?? 0) + 1);
  });
  return cats.map((c) => ({
    ...c,
    is_featured: c.is_featured === 1,
    name: name.get(c.id) ?? c.slug,
    products: count.get(c.id) ?? 0,
  }));
}

export default async function CategoriesListPage() {
  const [rows, { t }] = await Promise.all([load(), getT()]);
  return (
    <>
      <AdminHeader
        title={t("categories.title")}
        subtitle={t("categories.subtitle", { n: rows.length })}
        actions={
          <Link href="/admin/categories/new">
            <AdminButton variant="primary">
              <Plus className="size-4" /> {t("categories.new")}
            </AdminButton>
          </Link>
        }
      />

      <AdminSection>
        <div className="bg-background border-border/60 overflow-hidden rounded-3xl border">
          <table className="w-full text-sm">
            <thead className="border-border/60 border-b text-left">
              <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                <th>{t("common.name")}</th>
                <th>{t("common.slug")}</th>
                <th className="text-right">{t("categories.table.products")}</th>
                <th className="text-right">{t("categories.table.order")}</th>
                <th>{t("categories.table.featured")}</th>
                <th className="w-20 text-right">{t("common.actions")}</th>
              </tr>
            </thead>
            <tbody className="divide-border/60 divide-y">
              {rows.map((c) => (
                <tr key={c.id} className="hover:bg-muted/40">
                  <td className="text-primary px-6 py-4 font-medium">
                    {c.name}
                  </td>
                  <td className="text-secondary px-6 py-4 text-xs">
                    /{c.slug}
                  </td>
                  <td className="text-right px-6 py-4 font-mono">
                    {c.products}
                  </td>
                  <td className="text-right px-6 py-4 font-mono">
                    {c.sort_order}
                  </td>
                  <td className="px-6 py-4">
                    {c.is_featured ? (
                      <span className="bg-accent/15 text-accent rounded-full px-2 py-0.5 text-[10px] uppercase tracking-[0.2em]">
                        {t("common.yes")}
                      </span>
                    ) : (
                      <span className="text-secondary text-xs">{t("common.no")}</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="text-primary text-xs underline underline-offset-4"
                    >
                      {t("common.edit")}
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </AdminSection>
    </>
  );
}
