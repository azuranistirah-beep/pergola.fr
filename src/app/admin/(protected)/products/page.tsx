import Link from "next/link";
import { Plus, Search } from "lucide-react";
import {
  AdminButton,
  AdminHeader,
  AdminSection,
} from "@/features/admin/admin-ui";
import { insforgeAdmin } from "@/lib/insforge-admin";
import { formatEUR } from "@/lib/utils";

async function loadProducts() {
  const { data: products } = await insforgeAdmin.database
    .from("products")
    .select(
      "id, slug, sku, status, base_price_cents, is_featured, category_id",
    )
    .order("updated_at", { ascending: false });
  const { data: translations } = await insforgeAdmin.database
    .from("product_translations")
    .select("product_id, locale, name")
    .eq("locale", "fr");
  const { data: cats } = await insforgeAdmin.database
    .from("categories")
    .select("id, slug");
  const nameById = new Map<string, string>();
  (translations ?? []).forEach((t) => nameById.set(t.product_id, t.name));
  const catSlug = new Map<string, string>();
  (cats ?? []).forEach((c) => catSlug.set(c.id, c.slug));
  return (products ?? []).map((p) => ({
    ...p,
    name: nameById.get(p.id) ?? p.slug,
    categorySlug: catSlug.get(p.category_id) ?? "—",
  }));
}

const statusLabel: Record<string, string> = {
  PUBLISHED: "Publié",
  DRAFT: "Brouillon",
  ARCHIVED: "Archivé",
};
const statusTone: Record<string, string> = {
  PUBLISHED: "bg-accent/15 text-accent",
  DRAFT: "bg-muted text-secondary",
  ARCHIVED: "bg-muted text-secondary",
};

export default async function ProductsListPage() {
  const products = await loadProducts();
  return (
    <>
      <AdminHeader
        title="Produits"
        subtitle={`${products.length} article${products.length > 1 ? "s" : ""} au catalogue`}
        actions={
          <Link href="/admin/products/new">
            <AdminButton variant="primary">
              <Plus className="size-4" /> Nouveau produit
            </AdminButton>
          </Link>
        }
      />

      <AdminSection>
        <div className="bg-background border-border/60 rounded-3xl border">
          <div className="border-border/60 flex items-center gap-3 border-b px-6 py-4">
            <Search className="text-secondary size-4" />
            <input
              placeholder="Rechercher un produit, SKU, slug…"
              className="flex-1 bg-transparent text-sm outline-none placeholder:text-secondary/50"
            />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-border/60 border-b text-left">
                <tr className="text-secondary [&_th]:px-6 [&_th]:py-3 [&_th]:text-[10px] [&_th]:font-medium [&_th]:uppercase [&_th]:tracking-[0.2em]">
                  <th>Nom</th>
                  <th>SKU</th>
                  <th>Catégorie</th>
                  <th className="text-right">Prix</th>
                  <th>Statut</th>
                  <th className="w-20 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-border/60 divide-y">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-muted/40">
                    <td className="px-6 py-4">
                      <div className="text-primary font-medium">{p.name}</div>
                      <div className="text-secondary text-xs">/{p.slug}</div>
                    </td>
                    <td className="text-secondary px-6 py-4 font-mono text-xs">
                      {p.sku}
                    </td>
                    <td className="text-secondary px-6 py-4 text-xs">
                      {p.categorySlug}
                    </td>
                    <td className="px-6 py-4 text-right font-mono">
                      {formatEUR(p.base_price_cents)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`rounded-full px-2.5 py-1 text-[10px] uppercase tracking-[0.2em] ${statusTone[p.status] ?? ""}`}
                      >
                        {statusLabel[p.status] ?? p.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link
                        href={`/admin/products/${p.id}`}
                        className="text-primary text-xs underline underline-offset-4"
                      >
                        Éditer
                      </Link>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-secondary p-12 text-center text-sm">
                      Aucun produit. Créez-en un depuis le bouton en haut à droite.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </AdminSection>
    </>
  );
}
