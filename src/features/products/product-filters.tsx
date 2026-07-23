"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn, formatEUR } from "@/lib/utils";
import type {
  PergolaColorway,
  PergolaProduct,
  ProductMaterial,
} from "./types";

export interface ActiveFilters {
  materials: Set<ProductMaterial>;
  colorways: Set<PergolaColorway>;
  families: Set<string>;
  sizeBucket: "any" | "small" | "medium" | "large";
  maxPrice: number;
  sort: "featured" | "priceAsc" | "priceDesc" | "sizeDesc";
}

interface Props {
  products: PergolaProduct[];
  onFilteredChange: (filtered: PergolaProduct[]) => void;
}

const sortValues = ["featured", "priceAsc", "priceDesc", "sizeDesc"] as const;
const colorwayOrder: PergolaColorway[] = [
  "warm-cedar",
  "walnut",
  "barnwood",
  "black",
  "white",
];
const sizeBuckets = ["any", "small", "medium", "large"] as const;

function bucketFor(p: PergolaProduct): "small" | "medium" | "large" {
  const sqft = p.widthFt * p.lengthFt;
  if (sqft < 130) return "small";
  if (sqft < 200) return "medium";
  return "large";
}

export function ProductFilters({ products, onFilteredChange }: Props) {
  const t = useTranslations("plp.filters");

  const priceBounds = React.useMemo(() => {
    const prices = products.map((p) => p.priceCents);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const [materials, setMaterials] = React.useState<Set<ProductMaterial>>(new Set());
  const [colorways, setColorways] = React.useState<Set<PergolaColorway>>(new Set());
  const [families, setFamilies] = React.useState<Set<string>>(new Set());
  const [sizeBucket, setSizeBucket] =
    React.useState<(typeof sizeBuckets)[number]>("any");
  const [maxPrice, setMaxPrice] = React.useState(priceBounds.max);
  const [sort, setSort] =
    React.useState<(typeof sortValues)[number]>("featured");

  const materialFacets = React.useMemo(() => {
    const counts = new Map<ProductMaterial, number>();
    products.forEach((p) => counts.set(p.material, (counts.get(p.material) ?? 0) + 1));
    return (["wood", "steel", "aluminium"] as ProductMaterial[])
      .filter((m) => counts.has(m))
      .map((m) => ({ key: m, count: counts.get(m) ?? 0 }));
  }, [products]);

  const colorwayFacets = React.useMemo(() => {
    const counts = new Map<PergolaColorway, number>();
    products.forEach((p) => counts.set(p.colorway, (counts.get(p.colorway) ?? 0) + 1));
    return colorwayOrder
      .filter((c) => counts.has(c))
      .map((c) => ({ key: c, count: counts.get(c) ?? 0 }));
  }, [products]);

  const familyFacets = React.useMemo(() => {
    const counts = new Map<string, number>();
    products.forEach((p) => {
      if (!p.family) return;
      counts.set(p.family, (counts.get(p.family) ?? 0) + 1);
    });
    return [...counts.entries()]
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([key, count]) => ({ key, count }));
  }, [products]);

  const filtered = React.useMemo(() => {
    let out = products;
    if (materials.size) out = out.filter((p) => materials.has(p.material));
    if (colorways.size) out = out.filter((p) => colorways.has(p.colorway));
    if (families.size) out = out.filter((p) => p.family && families.has(p.family));
    if (sizeBucket !== "any")
      out = out.filter((p) => bucketFor(p) === sizeBucket);
    out = out.filter((p) => p.priceCents <= maxPrice);
    const sorted = [...out];
    if (sort === "priceAsc") sorted.sort((a, b) => a.priceCents - b.priceCents);
    else if (sort === "priceDesc")
      sorted.sort((a, b) => b.priceCents - a.priceCents);
    else if (sort === "sizeDesc")
      sorted.sort((a, b) => b.widthFt * b.lengthFt - a.widthFt * a.lengthFt);
    else sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return sorted;
  }, [products, materials, colorways, families, sizeBucket, maxPrice, sort]);

  React.useEffect(() => {
    onFilteredChange(filtered);
  }, [filtered, onFilteredChange]);

  const toggle = <T,>(set: Set<T>, setter: (s: Set<T>) => void, v: T) => {
    const next = new Set(set);
    if (next.has(v)) next.delete(v);
    else next.add(v);
    setter(next);
  };

  const anyActive =
    materials.size > 0 ||
    colorways.size > 0 ||
    families.size > 0 ||
    sizeBucket !== "any" ||
    maxPrice < priceBounds.max;

  const reset = () => {
    setMaterials(new Set());
    setColorways(new Set());
    setFamilies(new Set());
    setSizeBucket("any");
    setMaxPrice(priceBounds.max);
  };

  const chipClass = (active: boolean) =>
    cn(
      "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
      active
        ? "border-primary bg-primary text-primary-foreground"
        : "border-border text-primary hover:border-primary",
    );

  return (
    <div className="border-border/60 flex flex-col gap-6 border-b pb-8">
      {/* Row: material + sort */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-secondary text-[10px] uppercase tracking-[0.25em]">
            {t("material")}
          </span>
          {materialFacets.map((f) => (
            <button
              key={f.key}
              onClick={() => toggle(materials, setMaterials, f.key)}
              className={chipClass(materials.has(f.key))}
            >
              {t(`materials.${f.key}`)}
              <span className="text-secondary ml-1.5 text-[10px]">({f.count})</span>
            </button>
          ))}
        </div>
        <div className="flex items-center gap-3">
          <span className="text-secondary text-[10px] uppercase tracking-[0.25em]">
            {t("sortLabel")}
          </span>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as typeof sort)}
            className="border-border focus:border-primary rounded-full border bg-transparent px-4 py-1.5 text-xs font-medium outline-none"
          >
            {sortValues.map((v) => (
              <option key={v} value={v}>
                {t(`sort.${v}`)}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Row: colorway */}
      {colorwayFacets.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-secondary text-[10px] uppercase tracking-[0.25em]">
            {t("colorway")}
          </span>
          {colorwayFacets.map((f) => (
            <button
              key={f.key}
              onClick={() => toggle(colorways, setColorways, f.key)}
              className={chipClass(colorways.has(f.key))}
            >
              {t(`colorways.${f.key}`)}
              <span className="text-secondary ml-1.5 text-[10px]">({f.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Row: size buckets */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-secondary text-[10px] uppercase tracking-[0.25em]">
          {t("size")}
        </span>
        {sizeBuckets.map((b) => (
          <button
            key={b}
            onClick={() => setSizeBucket(b)}
            className={chipClass(sizeBucket === b)}
          >
            {t(`sizes.${b}`)}
          </button>
        ))}
      </div>

      {/* Row: family (top 10) */}
      {familyFacets.length > 1 && (
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-secondary text-[10px] uppercase tracking-[0.25em]">
            {t("family")}
          </span>
          {familyFacets.map((f) => (
            <button
              key={f.key}
              onClick={() => toggle(families, setFamilies, f.key)}
              className={chipClass(families.has(f.key))}
            >
              {f.key.charAt(0).toUpperCase() + f.key.slice(1)}
              <span className="text-secondary ml-1.5 text-[10px]">({f.count})</span>
            </button>
          ))}
        </div>
      )}

      {/* Row: budget slider + reset */}
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-6">
        <span className="text-secondary text-[10px] uppercase tracking-[0.25em] md:min-w-[70px]">
          {t("budget")}
        </span>
        <input
          type="range"
          min={priceBounds.min}
          max={priceBounds.max}
          step={5000}
          value={maxPrice}
          onChange={(e) => setMaxPrice(Number(e.target.value))}
          className="accent-accent flex-1"
        />
        <div className="text-primary text-xs">
          {t("upTo")} <span className="font-medium">{formatEUR(maxPrice)}</span>
        </div>
        {anyActive && (
          <button
            onClick={reset}
            className="text-secondary hover:text-primary inline-flex items-center gap-1 text-xs underline underline-offset-4"
          >
            <X className="size-3" /> {t("reset")}
          </button>
        )}
      </div>
    </div>
  );
}
