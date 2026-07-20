import Link from "next/link";
import { Plus } from "lucide-react";
import {
  AdminButton,
  AdminHeader,
  AdminSection,
} from "@/features/admin/admin-ui";
import { insforgeAdmin } from "@/lib/insforge-admin";

async function load() {
  const { data: cats } = await insforgeAdmin.database
    .from("categories")
    .select("id, slug, sort_order, is_featured")
    .order("sort_order", { ascending: true });
  const { data: tr } = await insforgeAdmin.database
    .from("category_translations")
    .select("category_id, locale, name")
    .eq("locale", "fr");
  const { data: products } = await insforgeAdmin.database
    .from("products")
    .select("category_id");
  const name = new Map<string, string>();
  (tr ?? []).forEach((t) => name.set(t.category_id, t.name));
  const count = new Map<string, number>();
  (products ?? []).forEach((p) => {
    count.set(p.category_id, (count.get(p.category_id) ?? 0) + 1);
  });
  return (cats ?? []).map((c) => ({
    ...c,
    name: name.get(c.id) ?? c.slug,
    products: count.get(c.id) ?? 0,
  }));
}

export default async function CategoriesListPage() {
  const rows = await load();
  return (
    <>
      <AdminHeader
        title="Catégories"
        subtitle={`${rows.length} famille${rows.length > 1 ? "s" : ""}`}
        actions={
          <Link href="/admin/categories/new">
            <AdminButton variant="primary">
              <Plus className="size-4" /> Nouvelle catégorie
            </AdminButton>
          </Link>
        }
      />

      <AdminSection>
        <div className="bg-background border-border/60 overflow-hidden rounded-3xl border">
          <table className="w-full text-sm">
            <thead className="border-border/60 border-b text-left">
              <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                <th>Nom</th>
                <th>Slug</th>
                <th className="text-right">Produits</th>
                <th className="text-right">Ordre</th>
                <th>Mise en avant</th>
                <th className="w-20 text-right">Actions</th>
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
                        Oui
                      </span>
                    ) : (
                      <span className="text-secondary text-xs">Non</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <Link
                      href={`/admin/categories/${c.id}`}
                      className="text-primary text-xs underline underline-offset-4"
                    >
                      Éditer
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
