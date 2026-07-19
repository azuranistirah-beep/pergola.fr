"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ProductCard } from "./product-card";
import { ProductFilters } from "./product-filters";
import type { PergolaProduct } from "./types";

export function ProductGrid({ products }: { products: PergolaProduct[] }) {
  const t = useTranslations("home.categories");
  const [filtered, setFiltered] = React.useState<PergolaProduct[]>(products);
  const handleChange = React.useCallback(
    (next: PergolaProduct[]) => setFiltered(next),
    [],
  );

  return (
    <div className="flex flex-col gap-10">
      <ProductFilters products={products} onFilteredChange={handleChange} />
      <div className="text-secondary text-xs">
        {t("productsCount", { count: filtered.length })}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
    </div>
  );
}
