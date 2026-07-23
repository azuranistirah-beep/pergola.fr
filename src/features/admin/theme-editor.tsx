"use client";

import * as React from "react";
import { toast } from "sonner";
import { RotateCcw } from "lucide-react";
import {
  AdminButton,
  AdminCard,
  AdminLabel,
  AdminSection,
  fieldClass,
} from "@/features/admin/admin-ui";
import { useAdminT } from "@/features/admin/admin-i18n-provider";
import { saveTheme } from "@/actions/admin-actions";
import type { ThemeSettings } from "@/repositories/settings-repository";
import type { AdminMessageKey } from "@/lib/admin-i18n";

const defaults: ThemeSettings = {
  primary: "#111111",
  accent: "#c8a46b",
  background: "#fafafa",
  foreground: "#111111",
  secondary: "#555555",
  radius: 16,
};

const swatches: { key: AdminMessageKey; theme: Partial<ThemeSettings> }[] = [
  { key: "theme.palette.signature", theme: defaults },
  {
    key: "theme.palette.nocturne",
    theme: {
      primary: "#000000",
      accent: "#e8b96b",
      background: "#0f0f0f",
      foreground: "#f5f5f5",
      secondary: "#a3a3a3",
    },
  },
  {
    key: "theme.palette.seaside",
    theme: {
      primary: "#1e3a5f",
      accent: "#c8a46b",
      background: "#f7f5ef",
      foreground: "#1e3a5f",
      secondary: "#5c7594",
    },
  },
  {
    key: "theme.palette.forest",
    theme: {
      primary: "#2d3f2a",
      accent: "#c9a05e",
      background: "#f4f1e8",
      foreground: "#2d3f2a",
      secondary: "#5c6b5a",
    },
  },
  {
    key: "theme.palette.warmMarble",
    theme: {
      primary: "#2a1e14",
      accent: "#b78659",
      background: "#f6ece0",
      foreground: "#2a1e14",
      secondary: "#7a6656",
    },
  },
];

export function ThemeEditor({ initial }: { initial: ThemeSettings }) {
  const { t } = useAdminT();
  const [theme, setTheme] = React.useState<ThemeSettings>(initial);
  const [pending, setPending] = React.useState(false);

  const set = <K extends keyof ThemeSettings>(k: K, v: ThemeSettings[K]) =>
    setTheme((prev) => ({ ...prev, [k]: v }));

  const save = async () => {
    setPending(true);
    try {
      await saveTheme(theme);
      toast.success(t("theme.applied"), { description: t("theme.appliedDesc") });
    } catch (e) {
      toast.error(t("common.error"), {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="space-y-8">
      <AdminSection title={t("theme.palettes")} description={t("theme.palettes.hint")}>
        <div className="grid gap-3 md:grid-cols-3 xl:grid-cols-5">
          {swatches.map((s) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setTheme((prev) => ({ ...prev, ...s.theme }))}
              className="border-border/60 hover:border-primary group flex flex-col gap-3 rounded-2xl border p-4 text-left transition-colors"
            >
              <div className="flex gap-1.5">
                {["primary", "accent", "background", "foreground", "secondary"].map(
                  (k) => (
                    <span
                      key={k}
                      className="ring-border/40 size-6 rounded-full ring-1"
                      style={{
                        background: (s.theme as Record<string, string>)[k],
                      }}
                    />
                  ),
                )}
              </div>
              <div className="text-primary text-xs font-medium">{t(s.key)}</div>
            </button>
          ))}
        </div>
      </AdminSection>

      <AdminSection title={t("theme.customization")}>
        <AdminCard>
          <div className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-5">
              <ColorField
                label={t("theme.field.primary")}
                value={theme.primary}
                onChange={(v) => set("primary", v)}
              />
              <ColorField
                label={t("theme.field.accent")}
                value={theme.accent}
                onChange={(v) => set("accent", v)}
              />
              <ColorField
                label={t("theme.field.background")}
                value={theme.background}
                onChange={(v) => set("background", v)}
              />
              <ColorField
                label={t("theme.field.foreground")}
                value={theme.foreground}
                onChange={(v) => set("foreground", v)}
              />
              <ColorField
                label={t("theme.field.secondary")}
                value={theme.secondary}
                onChange={(v) => set("secondary", v)}
              />
              <AdminLabel label={t("theme.field.radius", { n: theme.radius })}>
                <input
                  type="range"
                  min={0}
                  max={32}
                  step={2}
                  value={theme.radius}
                  onChange={(e) => set("radius", Number(e.target.value))}
                  className="accent-accent w-full"
                />
              </AdminLabel>
            </div>

            <div className="border-border/60 rounded-3xl border p-6">
              <div className="text-secondary text-[10px] uppercase tracking-[0.25em]">
                {t("theme.preview")}
              </div>
              <div
                className="mt-4 space-y-5 rounded-2xl p-6"
                style={{
                  background: theme.background,
                  color: theme.foreground,
                  borderRadius: theme.radius,
                }}
              >
                <div
                  style={{ color: theme.accent }}
                  className="text-[10px] uppercase tracking-[0.3em]"
                >
                  {t("theme.preview.collection")}
                </div>
                <h3
                  className="font-serif text-3xl leading-tight"
                  style={{ color: theme.foreground }}
                >
                  {t("theme.preview.title")}
                </h3>
                <p style={{ color: theme.secondary }} className="text-sm">
                  {t("theme.preview.body")}
                </p>
                <div className="flex gap-3">
                  <span
                    className="rounded-full px-5 py-2 text-xs font-medium"
                    style={{
                      background: theme.primary,
                      color: theme.background,
                    }}
                  >
                    Primary
                  </span>
                  <span
                    className="rounded-full px-5 py-2 text-xs font-medium"
                    style={{
                      background: theme.accent,
                      color: "#fff",
                    }}
                  >
                    Accent
                  </span>
                </div>
              </div>
            </div>
          </div>
        </AdminCard>
      </AdminSection>

      <div className="border-border/60 sticky bottom-0 flex items-center justify-between gap-3 border-t bg-background/95 p-8 backdrop-blur">
        <AdminButton
          type="button"
          variant="outline"
          onClick={() => setTheme(defaults)}
        >
          <RotateCcw className="size-4" /> {t("common.reset")}
        </AdminButton>
        <AdminButton
          type="button"
          variant="primary"
          onClick={save}
          disabled={pending}
        >
          {pending ? t("common.saving") : t("theme.applyToSite")}
        </AdminButton>
      </div>
    </div>
  );
}

function ColorField({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <label className="flex items-center gap-4">
      <input
        type="color"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="border-border/60 size-12 shrink-0 cursor-pointer rounded-2xl border"
      />
      <div className="flex-1">
        <div className="text-primary text-xs font-medium">{label}</div>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className={fieldClass + " mt-1.5 w-full font-mono"}
        />
      </div>
    </label>
  );
}
