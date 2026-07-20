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
import { createCategory, updateCategory } from "@/actions/admin-actions";

export interface CategoryFormValues {
  slug: string;
  sortOrder: string;
  isFeatured: boolean;
  nameFr: string;
  nameEn: string;
  descriptionFr: string;
  descriptionEn: string;
}

export function CategoryForm({
  categoryId,
  initial,
  onDelete,
}: {
  categoryId?: string;
  initial: CategoryFormValues;
  onDelete?: () => Promise<void>;
}) {
  const [values, setValues] = React.useState<CategoryFormValues>(initial);
  const [pending, setPending] = React.useState(false);

  const set = <K extends keyof CategoryFormValues>(
    k: K,
    v: CategoryFormValues[K],
  ) => setValues((prev) => ({ ...prev, [k]: v }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      const payload = {
        slug: values.slug,
        sortOrder: Number(values.sortOrder || 0),
        isFeatured: values.isFeatured,
        nameFr: values.nameFr,
        nameEn: values.nameEn,
        descriptionFr: values.descriptionFr,
        descriptionEn: values.descriptionEn,
      };
      if (categoryId) {
        await updateCategory(categoryId, payload);
        toast.success("Catégorie enregistrée");
      } else {
        await createCategory(payload);
      }
    } catch (err) {
      toast.error("Erreur", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AdminSection>
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
            <AdminLabel label="Slug URL">
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
            <AdminLabel label="Ordre d'affichage">
              <input
                type="number"
                value={values.sortOrder}
                onChange={(e) => set("sortOrder", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Description (FR)">
              <textarea
                value={values.descriptionFr}
                onChange={(e) => set("descriptionFr", e.target.value)}
                rows={3}
                className={fieldClass + " resize-none"}
              />
            </AdminLabel>
            <AdminLabel label="Description (EN)">
              <textarea
                value={values.descriptionEn}
                onChange={(e) => set("descriptionEn", e.target.value)}
                rows={3}
                className={fieldClass + " resize-none"}
              />
            </AdminLabel>
            <label className="flex items-center gap-3 text-sm md:col-span-2">
              <input
                type="checkbox"
                checked={values.isFeatured}
                onChange={(e) => set("isFeatured", e.target.checked)}
                className="accent-primary"
              />
              Mise en avant (affichée dans la sélection Home)
            </label>
          </div>
        </AdminCard>
      </AdminSection>

      <div className="border-border/60 sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 p-8 backdrop-blur">
        {onDelete ? (
          <form action={onDelete}>
            <AdminButton
              variant="danger"
              onClick={(e) => {
                if (!confirm("Supprimer cette catégorie ?"))
                  e.preventDefault();
              }}
            >
              Supprimer
            </AdminButton>
          </form>
        ) : (
          <span />
        )}
        <AdminButton type="submit" variant="primary" disabled={pending}>
          {pending ? "Enregistrement…" : categoryId ? "Enregistrer" : "Créer"}
        </AdminButton>
      </div>
    </form>
  );
}
