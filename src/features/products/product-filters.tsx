"use client";

import * as React from "react";
import { cn } from "@/lib/utils";
import type { PergolaProduct, ProductMaterial } from "./types";

type Facet = { key: string; label: string; count: number };

interface Props {
  products: PergolaProduct[];
  onFilteredChange: (filtered: PergolaProduct[]) => void;
}

const materialLabel: Record<ProductMaterial, string> = {
  wood: "Bois cèdre",
  steel: "Acier",
  aluminium: "Aluminium",
};

const sortOptions = [
  { value: "featured", label: "Sélection" },
  { value: "price-asc", label: "Prix croissant" },
  { value: "price-desc", label: "Prix décroissant" },
  { value: "size-desc", label: "Plus grande surface" },
] as const;

export function ProductFilters({ products, onFilteredChange }: Props) {
  const [materials, setMaterials] = React.useState<Set<ProductMaterial>>(
    new Set(),
  );
  const [sort, setSort] =
    React.useState<(typeof sortOptions)[number]["value"]>("featured");

  const materialFacets: Facet[] = React.useMemo(() => {
    const counts = new Map<ProductMaterial, number>();
    products.forEach((p) => counts.set(p.material, (counts.get(p.material) ?? 0) + 1));
    return (["wood", "steel", "aluminium"] as ProductMaterial[])
      .filter((m) => counts.has(m))
      .map((m) => ({ key: m, label: materialLabel[m], count: counts.get(m) ?? 0 }));
  }, [products]);

  const filtered = React.useMemo(() => {
    let out = products;
    if (materials.size) out = out.filter((p) => materials.has(p.material));
    const sorted = [...out];
    if (sort === "price-asc") sorted.sort((a, b) => a.priceCents - b.priceCents);
    else if (sort === "price-desc")
      sorted.sort((a, b) => b.priceCents - a.priceCents);
    else if (sort === "size-desc")
      sorted.sort(
        (a, b) => b.widthFt * b.lengthFt - a.widthFt * a.lengthFt,
      );
    else
      sorted.sort(
        (a, b) => Number(!!b.featured) - Number(!!a.featured),
      );
    return sorted;
  }, [products, materials, sort]);

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

  return (
    <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-secondary text-[10px] uppercase tracking-[0.25em]">
          Matériau
        </span>
        {materialFacets.map((f) => {
          const active = materials.has(f.key as ProductMaterial);
          return (
            <button
              key={f.key}
              onClick={() => toggleMaterial(f.key as ProductMaterial)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-xs font-medium transition-colors",
                active
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-primary hover:border-primary",
              )}
            >
              {f.label}
              <span className="text-secondary ml-1.5 text-[10px]">
                ({f.count})
              </span>
            </button>
          );
        })}
        {materials.size > 0 && (
          <button
            onClick={() => setMaterials(new Set())}
            className="text-secondary text-xs underline underline-offset-4"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <span className="text-secondary text-[10px] uppercase tracking-[0.25em]">
          Trier
        </span>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as typeof sort)}
          className="border-border bg-transparent rounded-full border px-4 py-1.5 text-xs font-medium focus:border-primary focus:outline-none"
        >
          {sortOptions.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
