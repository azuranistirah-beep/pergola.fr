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
import { useAdminT } from "@/features/admin/admin-i18n-provider";
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
  const { t } = useAdminT();
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
        toast.success(t("productForm.saveSuccess"));
      } else {
        await createProduct(payload);
      }
    } catch (err) {
      toast.error(t("productForm.saveError"), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AdminSection title={t("productForm.info")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-2">
            <AdminLabel label={t("productForm.nameFr")}>
              <input
                required
                value={values.nameFr}
                onChange={(e) => set("nameFr", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("productForm.nameEn")}>
              <input
                required
                value={values.nameEn}
                onChange={(e) => set("nameEn", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("productForm.slug")} hint={t("productForm.slugHint")}>
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
            <AdminLabel label={t("productForm.sku")}>
              <input
                required
                value={values.sku}
                onChange={(e) => set("sku", e.target.value.toUpperCase())}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("productForm.taglineFr")}>
              <textarea
                value={values.taglineFr}
                onChange={(e) => set("taglineFr", e.target.value)}
                rows={2}
                className={fieldClass + " resize-none"}
              />
            </AdminLabel>
            <AdminLabel label={t("productForm.taglineEn")}>
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

      <AdminSection title={t("productForm.priceStockCat")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-3">
            <AdminLabel label={t("productForm.priceEur")}>
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
            <AdminLabel label={t("productForm.stock")}>
              <input
                type="number"
                min={0}
                value={values.stock}
                onChange={(e) => set("stock", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("productForm.category")}>
              <select
                required
                value={values.categoryId}
                onChange={(e) => set("categoryId", e.target.value)}
                className={fieldClass}
              >
                <option value="">{t("productForm.categoryPlaceholder")}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </AdminLabel>
            <AdminLabel label={t("productForm.status")}>
              <select
                value={values.status}
                onChange={(e) =>
                  set("status", e.target.value as ProductFormValues["status"])
                }
                className={fieldClass}
              >
                <option value="DRAFT">{t("products.status.DRAFT")}</option>
                <option value="PUBLISHED">{t("products.status.PUBLISHED")}</option>
                <option value="ARCHIVED">{t("products.status.ARCHIVED")}</option>
              </select>
            </AdminLabel>
            <label className="flex items-center gap-3 text-sm md:col-span-2 md:mt-6">
              <input
                type="checkbox"
                checked={values.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
                className="accent-primary"
              />
              {t("productForm.featured")}
            </label>
            <label className="flex items-center gap-3 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={values.isConfigurable}
                onChange={(e) => set("isConfigurable", e.target.checked)}
                className="accent-primary"
              />
              {t("productForm.configurable")}
            </label>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title={t("productForm.attributes")}>
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-3">
            <AdminLabel label={t("productForm.family")} hint={t("productForm.familyHint")}>
              <input
                value={values.family}
                onChange={(e) => set("family", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("productForm.material")} hint={t("productForm.materialHint")}>
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
              label={t("productForm.colorway")}
              hint={t("productForm.colorwayHint")}
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
            <AdminLabel label={t("productForm.finish")}>
              <input
                value={values.finish}
                onChange={(e) => set("finish", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("productForm.widthFt")}>
              <input
                type="number"
                min={0}
                value={values.widthFt}
                onChange={(e) => set("widthFt", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label={t("productForm.lengthFt")}>
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
                  if (!confirm(t("productForm.deleteConfirm"))) e.preventDefault();
                }}
              >
                {t("common.delete")}
              </AdminButton>
            </form>
          )}
        </div>
        <div className="flex gap-3">
          <AdminButton type="submit" variant="primary" disabled={pending}>
            {pending
              ? t("common.saving")
              : productId
                ? t("common.save")
                : t("productForm.createBtn")}
          </AdminButton>
        </div>
      </div>
    </form>
  );
}
