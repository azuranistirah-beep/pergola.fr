import { Copy } from "lucide-react";
import Link from "next/link";
import {
  AdminCard,
  AdminHeader,
  AdminSection,
  KpiCard,
} from "@/features/admin/admin-ui";
import { insforgeAdmin } from "@/lib/insforge-admin";

interface MediaGroup {
  slug: string;
  productId: string;
  productName: string;
  images: { id: string; url: string; isCover: boolean }[];
}

async function load(): Promise<{
  groups: MediaGroup[];
  totalImages: number;
  totalProducts: number;
}> {
  const [prodRes, mediaRes, trRes] = await Promise.all([
    insforgeAdmin.database.from("products").select("id, slug"),
    insforgeAdmin.database
      .from("product_media")
      .select("id, product_id, url, is_cover, sort_order")
      .order("sort_order", { ascending: true }),
    insforgeAdmin.database
      .from("product_translations")
      .select("product_id, name")
      .eq("locale", "fr"),
  ]);

  const nameById = new Map<string, string>();
  (trRes.data ?? []).forEach((t) => nameById.set(t.product_id, t.name));

  const groups: MediaGroup[] = (prodRes.data ?? []).map((p) => ({
    productId: p.id,
    slug: p.slug,
    productName: nameById.get(p.id) ?? p.slug,
    images: (mediaRes.data ?? [])
      .filter((m) => m.product_id === p.id)
      .map((m) => ({ id: m.id, url: m.url, isCover: m.is_cover })),
  }));

  const totalImages = (mediaRes.data ?? []).length;
  const totalProducts = groups.filter((g) => g.images.length > 0).length;
  return { groups, totalImages, totalProducts };
}

export default async function MediaLibraryPage() {
  const { groups, totalImages, totalProducts } = await load();
  return (
    <>
      <AdminHeader
        title="Médiathèque"
        subtitle="Toutes les images du bucket InsForge, regroupées par produit."
      />

      <AdminSection>
        <div className="grid gap-4 md:grid-cols-3">
          <KpiCard label="Images totales" value={totalImages} />
          <KpiCard label="Produits avec images" value={totalProducts} />
          <KpiCard
            label="Bucket"
            value="products"
            hint="Public — servi via CDN InsForge"
          />
        </div>
      </AdminSection>

      <AdminSection>
        <div className="space-y-8">
          {groups.map((g) => (
            <AdminCard key={g.productId}>
              <div className="mb-5 flex items-center justify-between gap-4">
                <div>
                  <div className="text-primary font-serif text-lg">
                    {g.productName}
                  </div>
                  <div className="text-secondary text-xs">/{g.slug}</div>
                </div>
                <Link
                  href={`/admin/products/${g.productId}`}
                  className="text-primary text-xs underline underline-offset-4"
                >
                  Éditer le produit
                </Link>
              </div>
              {g.images.length === 0 ? (
                <div className="text-secondary bg-muted rounded-2xl p-6 text-center text-xs">
                  Aucune image pour ce produit. Uploader depuis la page du produit.
                </div>
              ) : (
                <div className="grid gap-3 md:grid-cols-6">
                  {g.images.map((img) => (
                    <a
                      key={img.id}
                      href={img.url}
                      target="_blank"
                      className="group bg-muted border-border/60 relative aspect-square overflow-hidden rounded-2xl border"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={img.url}
                        alt=""
                        className="h-full w-full object-cover"
                      />
                      {img.isCover && (
                        <span className="bg-accent/90 text-accent-foreground absolute left-2 top-2 rounded-full px-2 py-0.5 text-[8px] font-medium uppercase tracking-[0.2em]">
                          Cover
                        </span>
                      )}
                      <span className="absolute right-2 top-2 rounded-full bg-black/60 p-1 text-white opacity-0 transition-opacity group-hover:opacity-100">
                        <Copy className="size-3" />
                      </span>
                    </a>
                  ))}
                </div>
              )}
            </AdminCard>
          ))}
        </div>
      </AdminSection>
    </>
  );
}
