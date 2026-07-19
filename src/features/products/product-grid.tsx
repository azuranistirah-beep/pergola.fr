"use client";

import * as React from "react";
import { catalog } from "./catalog";
import { ProductCard } from "./product-card";
import { ProductFilters } from "./product-filters";
import type { PergolaProduct } from "./types";

export function ProductGrid() {
  const [filtered, setFiltered] = React.useState<PergolaProduct[]>(catalog);
  const handleChange = React.useCallback(
    (next: PergolaProduct[]) => setFiltered(next),
    [],
  );

  return (
    <div className="flex flex-col gap-10">
      <ProductFilters products={catalog} onFilteredChange={handleChange} />
      <div className="text-secondary text-xs">
        {filtered.length} produit{filtered.length > 1 ? "s" : ""}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
