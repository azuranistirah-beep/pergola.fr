import type {
  ConfigOption,
  OptionValue,
  ProductConfigurator,
  Selection,
} from "./config-types";

export interface PriceLine {
  code: string;
  amountCents: number;
  labelKey?: string;
  optCode?: string;
  valCode?: string;
}

export interface PriceBreakdown {
  baseCents: number;
  lines: PriceLine[];
  totalCents: number;
}

/** Return the currently-selected value for an option. */
export function getSelectedValue(
  option: ConfigOption,
  selection: Selection,
): OptionValue | undefined {
  if (option.type === "dimension") return option.values[0];
  const code = selection[option.code];
  return option.values.find((v) => v.code === code);
}

export function initialSelection(cfg: ProductConfigurator): Selection {
  const sel: Selection = {};
  cfg.options.forEach((opt) => {
    if (opt.type === "dimension") {
      const v = opt.values[0];
      if (v?.defaultMm) sel[opt.code] = v.defaultMm;
      return;
    }
    const def = opt.values.find((v) => v.isDefault) ?? opt.values[0];
    if (def) sel[opt.code] = def.code;
  });
  return sel;
}

/** Compute width × length area in square meters from the selection. */
export function computeAreaSqm(cfg: ProductConfigurator, selection: Selection) {
  const w = (selection.width as number | undefined) ?? 0;
  const l = (selection.length as number | undefined) ?? 0;
  return (w / 1000) * (l / 1000);
}

/** Compute the perimeter in linear meters. */
export function computePerimeterM(
  cfg: ProductConfigurator,
  selection: Selection,
) {
  const w = ((selection.width as number | undefined) ?? 0) / 1000;
  const l = ((selection.length as number | undefined) ?? 0) / 1000;
  return 2 * (w + l);
}

/** Base dimension pricing: 4×3 m is the baseline. Anything larger scales. */
function dimensionUpcharge(cfg: ProductConfigurator, selection: Selection) {
  const baseArea = 12; // 4m × 3m baseline
  const area = computeAreaSqm(cfg, selection);
  const extra = Math.max(0, area - baseArea);
  // 240€ per extra m² beyond baseline (linear metre modifier flattened)
  return Math.round(extra * 32000);
}

// Add-on pricing policy (site-wide promo):
//   • every add-on shown at 50% of its list price
//   • total add-on ceiling of €100 above the base product price
// Keeping the list prices intact in `configurator-data.ts` documents the
// full-rate figure and lets us switch the promo off by flipping these two
// constants back to 1 / Infinity.
export const ADD_ON_MULTIPLIER = 0.5;
export const ADD_ON_CAP_CENTS = 10000; // €100

/** Apply the promo multiplier to a list-price value for display. */
export const applyAddOnPromo = (cents: number) =>
  Math.round(cents * ADD_ON_MULTIPLIER);

export function computePrice(
  cfg: ProductConfigurator,
  selection: Selection,
): PriceBreakdown {
  const lines: PriceBreakdown["lines"] = [];
  const dimExtra = dimensionUpcharge(cfg, selection);
  if (dimExtra > 0) {
    lines.push({
      code: "dimensions",
      labelKey: "customDimensions",
      amountCents: Math.round(dimExtra * ADD_ON_MULTIPLIER),
    });
  }

  const area = computeAreaSqm(cfg, selection);

  cfg.options.forEach((opt) => {
    if (opt.type === "dimension") return;
    const val = getSelectedValue(opt, selection);
    if (!val) return;
    if (val.priceCents === 0) return;

    let amt = 0;
    switch (val.priceKind) {
      case "flat":
        amt = val.priceCents;
        break;
      case "per_sqm":
        amt = Math.round(val.priceCents * area);
        break;
      case "per_linear_m":
        amt = Math.round(val.priceCents * computePerimeterM(cfg, selection));
        break;
      case "percent":
        amt = Math.round((cfg.basePriceCents * val.priceCents) / 10000);
        break;
    }
    // Apply the promo multiplier per-line so the breakdown reads honestly
    // (each line shows what it actually contributes to the total).
    amt = Math.round(amt * ADD_ON_MULTIPLIER);
    if (amt > 0) {
      lines.push({
        code: opt.code,
        optCode: opt.code,
        valCode: val.code,
        amountCents: amt,
      });
    }
  });

  // Add-on cap: if the discounted sum still exceeds €100, book the overshoot
  // as a negative "cap" line so the receipt stays self-explanatory —
  // options subtotal + rebate line = capped subtotal.
  const addOnSum = lines.reduce((s, l) => s + l.amountCents, 0);
  if (addOnSum > ADD_ON_CAP_CENTS) {
    lines.push({
      code: "add-on-cap",
      labelKey: "addOnCap",
      amountCents: -(addOnSum - ADD_ON_CAP_CENTS),
    });
  }

  const totalCents =
    cfg.basePriceCents + lines.reduce((s, l) => s + l.amountCents, 0);

  return { baseCents: cfg.basePriceCents, lines, totalCents };
}

export interface RuleConflict {
  targetOption: string;
  targetValue: string;
  sourceOption: string;
  sourceValue?: string;
}

/** Returns list of (option, value) pairs currently disabled by rules. */
export function computeConflicts(
  cfg: ProductConfigurator,
  selection: Selection,
): RuleConflict[] {
  const conflicts: RuleConflict[] = [];
  cfg.rules.forEach((rule) => {
    if (rule.action !== "incompatible") return;
    const src = selection[rule.sourceOption];
    if (src === undefined) return;
    if (rule.sourceValue && src !== rule.sourceValue) return;
    if (!rule.targetValue) return;
    conflicts.push({
      targetOption: rule.targetOption,
      targetValue: rule.targetValue,
      sourceOption: rule.sourceOption,
      sourceValue: rule.sourceValue,
    });
  });
  return conflicts;
}

export function isValueDisabled(
  optionCode: string,
  valueCode: string,
  conflicts: RuleConflict[],
) {
  return conflicts.some(
    (c) => c.targetOption === optionCode && c.targetValue === valueCode,
  );
}

/** Generate a live SKU that mutates as the customer picks. */
export function buildSku(
  cfg: ProductConfigurator,
  selection: Selection,
): string {
  const w = ((selection.width as number | undefined) ?? 0) / 100;
  const l = ((selection.length as number | undefined) ?? 0) / 100;
  const parts = ["PGL", `${Math.round(w)}${Math.round(l)}`];
  const codes = [
    selection.roof,
    selection.frame_color,
    selection.roof_color,
  ];
  codes.forEach((c) => {
    if (c) parts.push(String(c).slice(0, 3).toUpperCase());
  });
  return parts.join("-");
}
