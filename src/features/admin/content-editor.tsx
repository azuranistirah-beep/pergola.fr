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
import { saveContent } from "@/actions/admin-inbox-actions";
import type { ContentSettings } from "@/repositories/settings-repository";

export function ContentEditor({ initial }: { initial: ContentSettings }) {
  const { t } = useAdminT();
  const [v, setV] = React.useState<ContentSettings>(initial);
  const [pending, setPending] = React.useState(false);

  const set = <K extends keyof ContentSettings>(k: K, val: ContentSettings[K]) =>
    setV((prev) => ({ ...prev, [k]: val }));

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPending(true);
    try {
      await saveContent(v);
      toast.success(t("content.saved"), { description: t("content.savedDesc") });
    } catch (err) {
      toast.error(t("common.error"), {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <AdminSection
        title={t("content.heroTitle")}
        description={t("content.heroDesc")}
      >
        <AdminCard>
          <div className="grid gap-8 md:grid-cols-2">
            <div className="space-y-5">
              <div className="text-accent text-[10px] font-medium uppercase tracking-[0.3em]">
                {t("content.french")}
              </div>
              <AdminLabel label={t("content.eyebrowFr")}>
                <input
                  value={v.heroEyebrowFr}
                  onChange={(e) => set("heroEyebrowFr", e.target.value)}
                  className={fieldClass}
                />
              </AdminLabel>
              <AdminLabel label={t("content.mainTitle")}>
                <textarea
                  value={v.heroTitleFr}
                  onChange={(e) => set("heroTitleFr", e.target.value)}
                  rows={2}
                  className={fieldClass + " resize-none font-serif text-lg"}
                />
              </AdminLabel>
              <AdminLabel label={t("content.subtitleLabel")}>
                <textarea
                  value={v.heroSubtitleFr}
                  onChange={(e) => set("heroSubtitleFr", e.target.value)}
                  rows={4}
                  className={fieldClass + " resize-none"}
                />
              </AdminLabel>
            </div>

            <div className="space-y-5">
              <div className="text-accent text-[10px] font-medium uppercase tracking-[0.3em]">
                {t("content.english")}
              </div>
              <AdminLabel label={t("content.eyebrowEn")}>
                <input
                  value={v.heroEyebrowEn}
                  onChange={(e) => set("heroEyebrowEn", e.target.value)}
                  className={fieldClass}
                />
              </AdminLabel>
              <AdminLabel label={t("content.mainTitleEn")}>
                <textarea
                  value={v.heroTitleEn}
                  onChange={(e) => set("heroTitleEn", e.target.value)}
                  rows={2}
                  className={fieldClass + " resize-none font-serif text-lg"}
                />
              </AdminLabel>
              <AdminLabel label={t("content.subtitleLabelEn")}>
                <textarea
                  value={v.heroSubtitleEn}
                  onChange={(e) => set("heroSubtitleEn", e.target.value)}
                  rows={4}
                  className={fieldClass + " resize-none"}
                />
              </AdminLabel>
            </div>
          </div>
        </AdminCard>
      </AdminSection>

      <AdminSection title={t("content.preview")}>
        <div
          className="relative min-h-[320px] overflow-hidden rounded-3xl p-10 text-white"
          style={{
            background:
              "radial-gradient(70% 60% at 80% 30%, rgba(200,164,107,0.35) 0%, rgba(0,0,0,0) 55%), linear-gradient(180deg, #14100b 0%, #0f0d0a 100%)",
          }}
        >
          <div className="text-accent text-[10px] uppercase tracking-[0.3em]">
            {v.heroEyebrowFr}
          </div>
          <div className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
            {v.heroTitleFr}
          </div>
          <p className="mt-6 max-w-xl text-sm text-white/80 md:text-base">
            {v.heroSubtitleFr}
          </p>
        </div>
      </AdminSection>

      <div className="border-border/60 sticky bottom-0 flex items-center justify-end gap-3 border-t bg-background/95 p-8 backdrop-blur">
        <AdminButton type="submit" variant="primary" disabled={pending}>
          {pending ? t("common.publishing") : t("common.publish")}
        </AdminButton>
      </div>
    </form>
  );
}
