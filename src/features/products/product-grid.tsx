"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";
import { ProductFilters } from "./product-filters";
import type { PergolaProduct } from "./types";

const PAGE_SIZE = 30;

export function ProductGrid({ products }: { products: PergolaProduct[] }) {
  const t = useTranslations("home.categories");
  const pt = useTranslations("plp.pagination");
  const [filtered, setFiltered] = React.useState<PergolaProduct[]>(products);
  const [page, setPage] = React.useState(1);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const handleChange = React.useCallback((next: PergolaProduct[]) => {
    setFiltered(next);
    setPage(1);
  }, []);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const visible = React.useMemo(
    () =>
      filtered.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE),
    [filtered, currentPage],
  );

  const go = (p: number) => {
    setPage(p);
    if (typeof window !== "undefined") {
      requestAnimationFrame(() =>
        gridRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
      );
    }
  };

  return (
    <div className="flex flex-col gap-10">
      <ProductFilters products={products} onFilteredChange={handleChange} />
      <div ref={gridRef} className="text-secondary text-xs">
        {t("productsCount", { count: filtered.length })}
      </div>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {visible.map((p) => (
          <ProductCard key={p.slug} product={p} />
        ))}
      </div>
      {totalPages > 1 && (
        <Pagination
          current={currentPage}
          total={totalPages}
          onChange={go}
          prevLabel={pt("prev")}
          nextLabel={pt("next")}
        />
      )}
    </div>
  );
}

function Pagination({
  current,
  total,
  onChange,
  prevLabel,
  nextLabel,
}: {
  current: number;
  total: number;
  onChange: (p: number) => void;
  prevLabel: string;
  nextLabel: string;
}) {
  const items = pageWindow(current, total);
  return (
    <nav
      aria-label="Pagination"
      className="border-border/60 flex items-center justify-center gap-1 border-t pt-8"
    >
      <button
        onClick={() => onChange(current - 1)}
        disabled={current === 1}
        aria-label={prevLabel}
        className="border-border text-primary hover:border-primary inline-flex items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-30"
      >
        <ChevronLeft className="size-3.5" /> {prevLabel}
      </button>
      {items.map((it, i) =>
        it === "…" ? (
          <span
            key={`gap-${i}`}
            className="text-secondary px-2 text-xs"
            aria-hidden
          >
            …
          </span>
        ) : (
          <button
            key={it}
            onClick={() => onChange(it)}
            className={cn(
              "min-w-[36px] rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
              it === current
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-primary hover:border-primary",
            )}
            aria-current={it === current ? "page" : undefined}
          >
            {it}
          </button>
        ),
      )}
      <button
        onClick={() => onChange(current + 1)}
        disabled={current === total}
        aria-label={nextLabel}
        className="border-border text-primary hover:border-primary inline-flex items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-30"
      >
        {nextLabel} <ChevronRight className="size-3.5" />
      </button>
    </nav>
  );
}

function pageWindow(current: number, total: number): (number | "…")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);
  const out: (number | "…")[] = [1];
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  if (start > 2) out.push("…");
  for (let i = start; i <= end; i++) out.push(i);
  if (end < total - 1) out.push("…");
  out.push(total);
  return out;
}
