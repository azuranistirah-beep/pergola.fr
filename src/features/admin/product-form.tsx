"use client";

import * as React from "react";
import { toast } from "sonner";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminSection,
  fieldClass,
} from "@/features/admin/admin-ui";
import { createProduct, updateProduct } from "@/actions/admin-actions";

export interface ProductFormValues {
  slug: string;
  sku: string;
  categoryId: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  basePriceEur: string;
  stock: string;
  isConfigurable: boolean;
  isFeatured: boolean;
  family: string;
  material: string;
  colorway: string;
  finish: string;
  widthFt: string;
  lengthFt: string;
  nameFr: string;
  nameEn: string;
  taglineFr: string;
  taglineEn: string;
}

interface Props {
  productId?: string;
  categories: { id: string; label: string }[];
  initial: ProductFormValues;
  onDelete?: () => Promise<void>;
}

export function ProductForm({ productId, categories, initial, onDelete }: Props) {
  const [values, setValues] = React.useState<ProductFormValues>(initial);
  const [pending, setPending] = React.useState(false);

  const set = <K extends keyof ProductFormValues>(k: K, v: ProductFormValues[K]) =>
    setValues((prev) => ({ ...prev, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const payload = {
        slug: values.slug,
        sku: values.sku,
        categoryId: values.categoryId,
        status: values.status,
        basePriceCents: Math.round(Number(values.basePriceEur) * 100),
        stock: Number(values.stock),
        isConfigurable: values.isConfigurable,
        isFeatured: values.isFeatured,
        family: values.family || undefined,
        material: values.material || undefined,
        colorway: values.colorway || undefined,
        finish: values.finish || undefined,
        widthFt: values.widthFt ? Number(values.widthFt) : undefined,
        lengthFt: values.lengthFt ? Number(values.lengthFt) : undefined,
        widthCm: values.widthFt
          ? Math.round(Number(values.widthFt) * 30.48)
          : undefined,
        lengthCm: values.lengthFt
          ? Math.round(Number(values.lengthFt) * 30.48)
          : undefined,
        nameFr: values.nameFr,
        nameEn: values.nameEn,
        taglineFr: values.taglineFr,
        taglineEn: values.taglineEn,
      };

      if (productId) {
        await updateProduct(productId, payload);
        toast.success("Produit enregistré");
      } else {
        await createProduct(payload);
      }
    } catch (err) {
      toast.error("Erreur lors de l'enregistrement", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AdminSection title="Informations générales">
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-2">
            <AdminLabel label="Nom (FR)">
              <input
                required
                value={values.nameFr}
                onChange={(e) => set("nameFr", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Nom (EN)">
              <input
                required
                value={values.nameEn}
                onChange={(e) => set("nameEn", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Slug URL" hint="ex: beaumont-14x10">
              <input
                required
                value={values.slug}
                onChange={(e) =>
                  set(
                    "slug",
                    e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, "-"),
                  )
                }
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="SKU">
              <input
                required
                value={values.sku}
                onChange={(e) => set("sku", e.target.value.toUpperCase())}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Tagline (FR)">
              <textarea
                value={values.taglineFr}
                onChange={(e) => set("taglineFr", e.target.value)}
                rows={2}
                className={fieldClass + " resize-none"}
              />
            </AdminLabel>
            <AdminLabel label="Tagline (EN)">
              <textarea
                value={values.taglineEn}
                onChange={(e) => set("taglineEn", e.target.value)}
                rows={2}
                className={fieldClass + " resize-none"}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title="Prix, stock & catégorie">
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-3">
            <AdminLabel label="Prix EUR (TTC)">
              <input
                type="number"
                min={0}
                step={10}
                required
                value={values.basePriceEur}
                onChange={(e) => set("basePriceEur", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Stock">
              <input
                type="number"
                min={0}
                value={values.stock}
                onChange={(e) => set("stock", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Catégorie">
              <select
                required
                value={values.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={fieldClass}
              >
                <option value="">— Sélectionner —</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </AdminLabel>
            <AdminLabel label="Statut">
              <select
                value={values.status}
                onChange={(e) =>
                  set("status", e.target.value as ProductFormValues["status"])
                }
                className={fieldClass}
              >
                <option value="DRAFT">Brouillon</option>
                <option value="PUBLISHED">Publié</option>
                <option value="ARCHIVED">Archivé</option>
              </select>
            </AdminLabel>
            <label className="flex items-center gap-3 text-sm md:col-span-2 md:mt-6">
              <input
                type="checkbox"
                checked={values.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
                className="accent-primary"
              />
              Mise en avant sur l&apos;accueil
            </label>
            <label className="flex items-center gap-3 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={values.isConfigurable}
                onChange={(e) => set("isConfigurable", e.target.checked)}
                className="accent-primary"
              />
              Disponible dans le configurateur
            </label>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title="Attributs">
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-3">
            <AdminLabel label="Famille" hint="beaumont, sarasota, evanston…">
              <input
                value={values.family}
                onChange={(e) => set("family", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Matériau" hint="wood / steel / aluminium">
              <select
                value={values.material}
                onChange={(e) => set("material", e.target.value)}
                className={fieldClass}
              >
                <option value="">—</option>
                <option value="wood">wood</option>
                <option value="steel">steel</option>
                <option value="aluminium">aluminium</option>
              </select>
            </AdminLabel>
            <AdminLabel
              label="Colorway"
              hint="warm-cedar / walnut / barnwood / black / white"
            >
              <select
                value={values.colorway}
                onChange={(e) => set("colorway", e.target.value)}
                className={fieldClass}
              >
                <option value="">—</option>
                <option value="warm-cedar">warm-cedar</option>
                <option value="walnut">walnut</option>
                <option value="barnwood">barnwood</option>
                <option value="black">black</option>
                <option value="white">white</option>
              </select>
            </AdminLabel>
            <AdminLabel label="Finition">
              <input
                value={values.finish}
                onChange={(e) => set("finish", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Largeur (ft)">
              <input
                type="number"
                min={0}
                value={values.widthFt}
                onChange={(e) => set("widthFt", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Longueur (ft)">
              <input
                type="number"
                min={0}
                value={values.lengthFt}
                onChange={(e) => set("lengthFt", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <div className="border-border/60 sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 p-8 backdrop-blur">
        <div>
          {onDelete && (
            <form action={onDelete}>
              <AdminButton
                type="submit"
                variant="danger"
                onClick={(e) => {
                  if (!confirm("Supprimer ce produit ?")) e.preventDefault();
                }}
              >
                Supprimer
              </AdminButton>
            </form>
          )}
        </div>
        <div className="flex gap-3">
          <AdminButton type="submit" variant="primary" disabled={pending}>
            {pending ? "Enregistrement…" : productId ? "Enregistrer" : "Créer le produit"}
          </AdminButton>
        </div>
      </div>
    </form>
  );
}
