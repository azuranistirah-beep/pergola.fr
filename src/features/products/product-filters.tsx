"use client";

import * as React from "react";
import { X } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn, formatEUR } from "@/lib/utils";
import type { PergolaProduct, ProductMaterial } from "./types";

interface Props {
  products: PergolaProduct[];
  onFilteredChange: (filtered: PergolaProduct[]) => void;
}

const sortValues = [
  "featured",
  "priceAsc",
  "priceDesc",
  "sizeDesc",
] as const;

export function ProductFilters({ products, onFilteredChange }: Props) {
  const t = useTranslations("plp.filters");

  const priceBounds = React.useMemo(() => {
    const prices = products.map((p) => p.priceCents);
    return { min: Math.min(...prices), max: Math.max(...prices) };
  }, [products]);

  const [materials, setMaterials] = React.useState<Set<ProductMaterial>>(
    new Set(),
  );
  const [maxPrice, setMaxPrice] = React.useState(priceBounds.max);
  const [sort, setSort] =
    React.useState<(typeof sortValues)[number]>("featured");

  const materialFacets = React.useMemo(() => {
    const counts = new Map<ProductMaterial, number>();
    products.forEach((p) =>
      counts.set(p.material, (counts.get(p.material) ?? 0) + 1),
    );
    return (["wood", "steel", "aluminium"] as ProductMaterial[])
      .filter((m) => counts.has(m))
      .map((m) => ({ key: m, count: counts.get(m) ?? 0 }));
  }, [products]);

  const filtered = React.useMemo(() => {
    let out = products;
    if (materials.size) out = out.filter((p) => materials.has(p.material));
    out = out.filter((p) => p.priceCents <= maxPrice);
    const sorted = [...out];
    if (sort === "priceAsc") sorted.sort((a, b) => a.priceCents - b.priceCents);
    else if (sort === "priceDesc")
      sorted.sort((a, b) => b.priceCents - a.priceCents);
    else if (sort === "sizeDesc")
      sorted.sort(
        (a, b) => b.widthFt * b.lengthFt - a.widthFt * a.lengthFt,
      );
    else
      sorted.sort((a, b) => Number(!!b.featured) - Number(!!a.featured));
    return sorted;
  }, [products, materials, maxPrice, sort]);

  React.useEffect(() => {
    onFilteredChange(filtered);
  }, [filtered, onFilteredChange]);

  const toggleMaterial = (m: ProductMaterial) => {
    setMaterials((prev) => {
      const next = new Set(prev);
      if (next.has(m)) next.delete(m);
      else next.add(m);
      return next;
    });
  };

  const anyActive = materials.size > 0 || maxPrice < priceBounds.max;

  return (
    <div className="border-border/60 flex flex-col gap-6 border-b pb-8">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-secondary text-[10px] uppercase tracking-[0.25em]">
            {t("material")}
          </span>
          {materialFacets.map((f) => {
            const active = materials.has(f.key);
            return (
              <button
                key={f.key}
                onClick={() => toggleMaterial(f.key)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-primary hover:border-primary",
                )}
              >
                {t(`materials.${f.key}`)}
                <span className="text-secondary ml-1.5 text-[10px]">
                  ({f.count})
                </span>
              </button>
            );
          })}
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
          {t("upTo")}{" "}
          <span className="font-medium">{formatEUR(maxPrice)}</span>
        </div>
        {anyActive && (
          <button
            onClick={() => {
              setMaterials(new Set());
              setMaxPrice(priceBounds.max);
            }}
            className="text-secondary hover:text-primary inline-flex items-center gap-1 text-xs underline underline-offset-4"
          >
            <X className="size-3" /> {t("reset")}
          </button>
        )}
      </div>
    </div>
  );
}
