"use client";

import * as React from "react";
import { AlertTriangle, Check, ChevronRight, Loader2, Ruler } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useCart } from "@/features/cart/cart-store";
import { cn, formatEUR } from "@/lib/utils";
import {
  applyAddOnPromo,
  buildSku,
  computeAreaSqm,
  computeConflicts,
  computePrice,
  getSelectedValue,
  initialSelection,
  isValueDisabled,
} from "./engine";
import type { ProductConfigurator, Selection } from "./config-types";

export function Configurator({
  cfg,
  productName,
  productImageUrl,
}: {
  cfg: ProductConfigurator;
  /** When launched from a PDP, use the product's real name in the cart. */
  productName?: string;
  productImageUrl?: string;
}) {
  const t = useTranslations("configuratorPage");
  const tData = useTranslations("configuratorData");
  const locale = useLocale();
  const router = useRouter();
  const cart = useCart();
  const [pdfPending, setPdfPending] = React.useState(false);

  const [selection, setSelection] = React.useState<Selection>(() =>
    initialSelection(cfg),
  );

  const conflicts = React.useMemo(
    () => computeConflicts(cfg, selection),
    [cfg, selection],
  );
  const price = React.useMemo(
    () => computePrice(cfg, selection),
    [cfg, selection],
  );
  const sku = React.useMemo(() => buildSku(cfg, selection), [cfg, selection]);
  const area = React.useMemo(() => computeAreaSqm(cfg, selection), [cfg, selection]);

  const pick = (optionCode: string, value: string | number) =>
    setSelection((prev) => ({ ...prev, [optionCode]: value }));

  const frameColor =
    getSelectedValue(cfg.options.find((o) => o.code === "frame_color")!, selection)
      ?.swatch ?? "#3a3d40";
  const roofColorValue = getSelectedValue(
    cfg.options.find((o) => o.code === "roof_color")!,
    selection,
  );
  const roofColor = roofColorValue?.code === "identique" ? frameColor : roofColorValue?.swatch ?? frameColor;

  function buildConfiguration(): Record<string, string> {
    const configuration: Record<string, string> = {};
    cfg.options.forEach((opt) => {
      const optLabel = tData(`options.${opt.code}.label`);
      if (opt.type === "dimension") {
        const mm = (selection[opt.code] as number | undefined) ?? 0;
        configuration[optLabel] = `${(mm / 1000).toFixed(2)} m`;
      } else {
        const val = getSelectedValue(opt, selection);
        if (val) {
          configuration[optLabel] = tData(
            `options.${opt.code}.values.${val.code}`,
          );
        }
      }
    });
    return configuration;
  }

  function handleAddToCart() {
    cart.add({
      productSlug: cfg.productSlug,
      name: productName ?? t("productName"),
      sku,
      imageUrl: productImageUrl,
      unitPriceCents: price.totalCents,
      quantity: 1,
      configuration: buildConfiguration(),
    });
    router.push("/panier");
  }

  async function handleDownloadPdf() {
    if (pdfPending) return;
    setPdfPending(true);
    try {
      const configuration = buildConfiguration();
      const adjustments = price.lines.map((l) => ({
        label: l.labelKey
          ? t(l.labelKey)
          : `${tData(`options.${l.optCode}.label`)} — ${tData(`options.${l.optCode}.values.${l.valCode}`)}`,
        amountCents: l.amountCents,
      }));
      const res = await fetch("/api/quote-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          productName: productName ?? t("productName"),
          sku,
          totalCents: price.totalCents,
          basePriceCents: price.baseCents,
          adjustments,
          configuration,
          areaSqm: area,
          locale: locale === "en" ? "en" : "fr",
        }),
      });
      if (!res.ok) throw new Error(`PDF failed: ${res.status}`);
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `pergolafr-quote-${sku}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error(err);
      alert(t("requestQuoteError"));
    } finally {
      setPdfPending(false);
    }
  }

  return (
    <div className="bg-muted min-h-screen pt-24 pb-16 md:pt-32 md:pb-24">
      <Container>
        <div className="mb-8 flex flex-col gap-3 md:mb-10">
          <Eyebrow>{t("eyebrow")}</Eyebrow>
          <h1 className="font-serif text-3xl leading-tight md:text-6xl">
            {productName ?? t("pageTitle")}
          </h1>
          <p className="text-secondary max-w-2xl text-sm md:text-base">
            {t("pageDescription")}
          </p>
        </div>

        <div className="grid gap-6 md:gap-8 lg:grid-cols-[1.4fr_1fr]">
          {/* Options column */}
          <div className="space-y-8">
            {cfg.options.map((opt) => {
              const label = tData(`options.${opt.code}.label`);
              const helper = opt.helper
                ? tData(`options.${opt.code}.helper`)
                : undefined;
              return (
                <div
                  key={opt.code}
                  className="bg-background border-border/70 rounded-[var(--radius-lg)] border p-4 md:p-8"
                >
                  <div className="mb-5 flex items-baseline justify-between gap-4">
                    <div>
                      <h3 className="font-serif text-lg">{label}</h3>
                      {helper && (
                        <p className="text-secondary mt-1 text-xs">{helper}</p>
                      )}
                    </div>
                    {opt.required && (
                      <span className="text-accent text-[10px] uppercase tracking-[0.25em]">
                        {t("required")}
                      </span>
                    )}
                  </div>

                  {opt.type === "dimension" ? (
                    <DimensionSlider
                      option={opt}
                      value={(selection[opt.code] as number) ?? 0}
                      onChange={(v) => pick(opt.code, v)}
                    />
                  ) : opt.type === "frame-color" || opt.type === "roof-color" ? (
                    <SwatchGrid
                      option={opt}
                      selection={selection}
                      conflicts={conflicts}
                      onPick={pick}
                    />
                  ) : (
                    <OptionCards
                      option={opt}
                      selection={selection}
                      conflicts={conflicts}
                      onPick={pick}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* Summary column */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="bg-primary text-primary-foreground overflow-hidden rounded-[var(--radius-lg)]">
              {/* Live preview */}
              <div className="relative aspect-[16/10] overflow-hidden md:aspect-[4/3]">
                <PergolaPreview
                  frameColor={frameColor}
                  roofColor={roofColor}
                  widthMm={(selection.width as number) ?? 4000}
                  lengthMm={(selection.length as number) ?? 3000}
                />
                <div className="absolute inset-x-0 bottom-0 p-5">
                  <div className="text-[10px] uppercase tracking-[0.3em] text-white/60">
                    {t("reference")}
                  </div>
                  <div className="text-accent mt-1 font-mono text-sm">
                    {sku}
                  </div>
                </div>
              </div>

              <div className="space-y-5 p-6 md:p-8">
                <SummaryRow
                  label={t("footprint")}
                  value={`${area.toFixed(2)} m²`}
                />
                <SummaryRow
                  label={t("widthLength")}
                  value={`${(((selection.width as number) ?? 0) / 1000).toFixed(2)} × ${(((selection.length as number) ?? 0) / 1000).toFixed(2)} m`}
                />
                <SummaryRow
                  label={t("basePrice")}
                  value={formatEUR(price.baseCents)}
                />
                {price.lines.length > 0 && (
                  <div className="border-primary-foreground/10 border-t pt-5">
                    <div className="mb-3 text-[10px] uppercase tracking-[0.25em] text-white/50">
                      {t("adjustments")}
                    </div>
                    {price.lines.map((l) => {
                      const lineLabel = l.labelKey
                        ? t(l.labelKey)
                        : `${tData(`options.${l.optCode}.label`)} — ${tData(`options.${l.optCode}.values.${l.valCode}`)}`;
                      return (
                        <div
                          key={l.code + (l.valCode ?? l.labelKey ?? "")}
                          className="text-primary-foreground/80 flex justify-between gap-4 py-1 text-xs"
                        >
                          <span className="truncate">{lineLabel}</span>
                          <span className="whitespace-nowrap">
                            {l.amountCents < 0
                              ? `−${formatEUR(Math.abs(l.amountCents))}`
                              : `+${formatEUR(l.amountCents)}`}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                <div className="border-primary-foreground/10 border-t pt-5">
                  <div className="text-[10px] uppercase tracking-[0.25em] text-white/50">
                    {t("totalTTC")}
                  </div>
                  <div className="mt-1 flex items-baseline justify-between">
                    <span className="font-serif text-4xl">
                      {formatEUR(price.totalCents)}
                    </span>
                    <span className="text-xs text-white/60">
                      3× {formatEUR(Math.round(price.totalCents / 3))}
                    </span>
                  </div>
                </div>

                <div className="mt-4 flex flex-col gap-2">
                  <Button
                    variant="accent"
                    size="lg"
                    className="w-full"
                    onClick={handleAddToCart}
                  >
                    {t("addToCart")}
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-full border-white/30 bg-transparent text-white hover:border-white hover:bg-white hover:text-primary"
                    onClick={handleDownloadPdf}
                    disabled={pdfPending}
                  >
                    {pdfPending ? (
                      <>
                        <Loader2 className="animate-spin" />{" "}
                        {t("requestQuotePending")}
                      </>
                    ) : (
                      t("requestQuote")
                    )}
                  </Button>
                </div>

                <div className="text-primary-foreground/60 flex items-center gap-2 pt-2 text-xs">
                  <Ruler className="text-accent size-3.5" /> {t("deliveryEstimate")}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-baseline justify-between gap-3">
      <span className="text-primary-foreground/60 text-xs uppercase tracking-[0.2em]">
        {label}
      </span>
      <span className="text-sm">{value}</span>
    </div>
  );
}

function DimensionSlider({
  option,
  value,
  onChange,
}: {
  option: import("./config-types").ConfigOption;
  value: number;
  onChange: (v: number) => void;
}) {
  const v = option.values[0];
  if (!v || v.minMm === undefined || v.maxMm === undefined || v.stepMm === undefined)
    return null;
  const min = v.minMm;
  const max = v.maxMm;
  const step = v.stepMm;
  const current = value || v.defaultMm || min;
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="font-serif text-3xl">
          {(current / 1000).toFixed(2)}{" "}
          <span className="text-secondary text-sm">m</span>
        </span>
        <span className="text-secondary text-xs">
          {(min / 1000).toFixed(1)} m – {(max / 1000).toFixed(1)} m
        </span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={current}
        onChange={(e) => onChange(Number(e.target.value))}
        className="accent-accent mt-5 w-full"
      />
    </div>
  );
}

function OptionCards({
  option,
  selection,
  conflicts,
  onPick,
}: {
  option: import("./config-types").ConfigOption;
  selection: Selection;
  conflicts: import("./engine").RuleConflict[];
  onPick: (opt: string, v: string) => void;
}) {
  const t = useTranslations("configuratorPage");
  const tData = useTranslations("configuratorData");
  const currentCode = selection[option.code];
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {option.values.map((v) => {
        const disabled = isValueDisabled(option.code, v.code, conflicts);
        const active = currentCode === v.code && !disabled;
        const valueLabel = tData(`options.${option.code}.values.${v.code}`);
        return (
          <button
            key={v.code}
            disabled={disabled}
            onClick={() => onPick(option.code, v.code)}
            className={cn(
              "group relative flex flex-col items-start gap-2 rounded-2xl border p-4 text-left transition-all",
              active
                ? "border-primary bg-primary/5"
                : "border-border hover:border-primary/50",
              disabled && "cursor-not-allowed opacity-40",
            )}
          >
            <div className="flex w-full items-start justify-between gap-2">
              <div>
                <div className="text-sm font-medium">{valueLabel}</div>
                <div className="text-secondary mt-1 text-xs">
                  {v.priceCents === 0
                    ? t("included")
                    : `+${formatEUR(applyAddOnPromo(v.priceCents))}${v.priceKind === "per_sqm" ? "/m²" : v.priceKind === "per_linear_m" ? "/ml" : ""}`}
                </div>
              </div>
              <div
                className={cn(
                  "flex size-5 shrink-0 items-center justify-center rounded-full border transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border",
                )}
              >
                {active && <Check className="size-3" />}
              </div>
            </div>
            {disabled && (
              <div className="text-accent flex items-center gap-1 text-[10px]">
                <AlertTriangle className="size-3" /> {t("incompatible")}
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}

function SwatchGrid({
  option,
  selection,
  conflicts,
  onPick,
}: {
  option: import("./config-types").ConfigOption;
  selection: Selection;
  conflicts: import("./engine").RuleConflict[];
  onPick: (opt: string, v: string) => void;
}) {
  const tData = useTranslations("configuratorData");
  const currentCode = selection[option.code];
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {option.values.map((v) => {
        const disabled = isValueDisabled(option.code, v.code, conflicts);
        const active = currentCode === v.code && !disabled;
        const valueLabel = tData(`options.${option.code}.values.${v.code}`);
        return (
          <button
            key={v.code}
            disabled={disabled}
            onClick={() => onPick(option.code, v.code)}
            className={cn(
              "group flex items-center gap-3 rounded-2xl border p-3 text-left transition-all",
              active
                ? "border-primary"
                : "border-border hover:border-primary/50",
              disabled && "cursor-not-allowed opacity-40",
            )}
          >
            <span
              className="ring-border/50 size-8 shrink-0 rounded-full ring-1"
              style={{ background: v.swatch ?? "#ccc" }}
            />
            <span className="min-w-0">
              <span className="block truncate text-xs font-medium">{valueLabel}</span>
              {v.priceCents > 0 && (
                <span className="text-secondary block text-[10px]">
                  +{formatEUR(applyAddOnPromo(v.priceCents))}
                </span>
              )}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/**
 * SVG preview that scales with the selected width & length.
 * We map real millimetres to viewBox pixels around a reference (4000×3000 mm),
 * so the pergola visually grows/shrinks as the sliders move.
 */
function PergolaPreview({
  frameColor,
  roofColor,
  widthMm,
  lengthMm,
}: {
  frameColor: string;
  roofColor: string;
  widthMm: number;
  lengthMm: number;
}) {
  // Reference dimensions that fill the "default" layout below.
  const REF_W = 4000;
  const REF_L = 3000;
  const REF_PIX_W = 260; // pixels the pergola frame occupies horizontally at REF_W
  const REF_PIX_H = 100; // vertical projection of the roof depth at REF_L

  // Scale independently — width controls horizontal extent (façade),
  // length controls apparent depth (projection).
  const widthScale = widthMm / REF_W;
  const depthScale = lengthMm / REF_L;

  const frameW = Math.max(140, Math.min(300, REF_PIX_W * widthScale));
  const frameH = Math.max(60, Math.min(140, REF_PIX_H * depthScale));

  const cx = 160; // horizontal centre of viewBox 0..320
  const roofY = 74; // top of the roof beam
  const groundY = 210; // where posts touch the floor
  const x0 = cx - frameW / 2;
  const x1 = cx + frameW / 2;
  const beamThickness = 10;
  const roofBottomY = roofY + frameH;
  const postW = 10;

  // Roof slats — number scales with width so density stays consistent.
  const slatCount = Math.max(6, Math.round(12 * widthScale));
  const slatGap = frameW / slatCount;
  const slatW = Math.max(6, Math.min(14, slatGap * 0.55));

  return (
    <div className="relative h-full w-full bg-gradient-to-b from-[#1c1a17] to-[#0f0d0a]">
      {/* soft ground */}
      <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-black/60 to-transparent" />
      <svg
        viewBox="0 0 320 240"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* roof slats */}
        {Array.from({ length: slatCount }).map((_, i) => (
          <rect
            key={i}
            x={x0 + beamThickness + i * slatGap + (slatGap - slatW) / 2}
            y={roofY - 10}
            width={slatW}
            height={frameH + 4}
            fill={roofColor}
            style={{ transition: "fill 300ms, height 250ms, x 250ms" }}
          />
        ))}
        {/* top & bottom roof beams (frame) */}
        <rect
          x={x0}
          y={roofY - 10}
          width={frameW}
          height={beamThickness}
          fill={frameColor}
          style={{ transition: "fill 300ms, x 250ms, width 250ms" }}
        />
        <rect
          x={x0}
          y={roofBottomY - 6}
          width={frameW}
          height={beamThickness}
          fill={frameColor}
          style={{ transition: "fill 300ms, x 250ms, width 250ms, y 250ms" }}
        />
        {/* posts */}
        <rect
          x={x0 + 4}
          y={roofY}
          width={postW}
          height={groundY - roofY}
          fill={frameColor}
          style={{ transition: "fill 300ms, x 250ms" }}
        />
        <rect
          x={x1 - postW - 4}
          y={roofY}
          width={postW}
          height={groundY - roofY}
          fill={frameColor}
          style={{ transition: "fill 300ms, x 250ms" }}
        />
      </svg>
      {/* size chip */}
      <div className="absolute right-3 top-3 rounded-full bg-black/40 px-3 py-1 font-mono text-[10px] text-white/80 backdrop-blur">
        {(widthMm / 1000).toFixed(2)} × {(lengthMm / 1000).toFixed(2)} m
      </div>
    </div>
  );
}
