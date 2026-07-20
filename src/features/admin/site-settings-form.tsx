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
import { saveSite } from "@/actions/admin-actions";
import type { SiteInfoSettings } from "@/repositories/settings-repository";

export function SiteSettingsForm({ initial }: { initial: SiteInfoSettings }) {
  const [v, setV] = React.useState<SiteInfoSettings>(initial);
  const [pending, setPending] = React.useState(false);

  const set = <K extends keyof SiteInfoSettings>(k: K, val: SiteInfoSettings[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await saveSite(v);
      toast.success("Paramètres enregistrés");
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
      <AdminSection title="Coordonnées & showroom">
        <AdminCard>
          <div className="grid gap-5 md:grid-cols-2">
            <AdminLabel label="Téléphone">
              <input
                value={v.phone}
                onChange={(e) => set("phone", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Email">
              <input
                type="email"
                value={v.email}
                onChange={(e) => set("email", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Adresse showroom">
              <input
                value={v.showroomAddress}
                onChange={(e) => set("showroomAddress", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Horaires">
              <input
                value={v.showroomHours}
                onChange={(e) => set("showroomHours", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
            <AdminLabel label="Instagram" hint="ex: @pergolafr">
              <input
                value={v.instagram}
                onChange={(e) => set("instagram", e.target.value)}
                className={fieldClass}
              />
            </AdminLabel>
          </div>
        </AdminCard>
      </AdminSection>

      <div className="border-border/60 sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background/95 p-8 backdrop-blur">
        <AdminButton type="submit" variant="primary" disabled={pending}>
          {pending ? "Enregistrement…" : "Enregistrer"}
        </AdminButton>
      </div>
    </form>
  );
}
