"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { ProductCard } from "@/features/products/product-card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import type {
  PergolaProduct,
  ProductCategory,
} from "@/features/products/types";

const PAGE_SIZE = 30;

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

const categoryDefs: { code: "all" | ProductCategory; labelKey: string }[] = [
  { code: "all", labelKey: "all" },
  { code: "pergola-bois", labelKey: "wood" },
  { code: "pergola-lame-orientable", labelKey: "louvered" },
  { code: "pergola-adossee", labelKey: "wallmount" },
  { code: "pergola-aluminium", labelKey: "aluminium" },
  { code: "pergola-cabana", labelKey: "cabana" },
];

export function CategoryStrip({ products }: { products: PergolaProduct[] }) {
  const t = useTranslations("home.categories");
  const pt = useTranslations("plp.pagination");
  const [active, setActive] = React.useState<"all" | ProductCategory>("all");
  const [page, setPage] = React.useState(1);
  const gridRef = React.useRef<HTMLDivElement>(null);

  const filtered = React.useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

  React.useEffect(() => setPage(1), [active]);

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
    <section id="collection" className="scroll-mt-24 py-16 md:py-24">
      <Container>
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <div>
            <Eyebrow>{t("eyebrow")}</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
              {t("title")}
            </h2>
          </div>
          <p className="text-secondary max-w-md text-sm md:text-right">
            {t("subtitle", { count: products.length })}
          </p>
        </div>

        <div className="border-border/60 mb-10 flex flex-wrap items-center gap-2 border-b pb-6">
          {categoryDefs.map((c) => {
            const count =
              c.code === "all"
                ? products.length
                : products.filter((p) => p.category === c.code).length;
            const isActive = active === c.code;
            return (
              <button
                key={c.code}
                onClick={() => setActive(c.code)}
                className={cn(
                  "rounded-full border px-5 py-2 text-xs font-medium transition-colors",
                  isActive
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border text-primary hover:border-primary",
                )}
              >
                {t(c.labelKey)}
                <span
                  className={cn(
                    "ml-2 text-[10px]",
                    isActive
                      ? "text-primary-foreground/70"
                      : "text-secondary",
                  )}
                >
                  ({count})
                </span>
              </button>
            );
          })}
        </div>

        <div ref={gridRef} className="text-secondary mb-6 text-xs">
          {t("productsCount", { count: filtered.length })}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>

        {totalPages > 1 && (
          <nav
            aria-label="Pagination"
            className="border-border/60 mt-12 flex items-center justify-center gap-1 border-t pt-8"
          >
            <button
              onClick={() => go(currentPage - 1)}
              disabled={currentPage === 1}
              aria-label={pt("prev")}
              className="border-border text-primary hover:border-primary inline-flex items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-30"
            >
              <ChevronLeft className="size-3.5" /> {pt("prev")}
            </button>
            {pageWindow(currentPage, totalPages).map((it, i) =>
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
                  onClick={() => go(it)}
                  className={cn(
                    "min-w-[36px] rounded-full border px-3 py-1.5 text-xs font-medium transition-colors",
                    it === currentPage
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border text-primary hover:border-primary",
                  )}
                  aria-current={it === currentPage ? "page" : undefined}
                >
                  {it}
                </button>
              ),
            )}
            <button
              onClick={() => go(currentPage + 1)}
              disabled={currentPage === totalPages}
              aria-label={pt("next")}
              className="border-border text-primary hover:border-primary inline-flex items-center gap-1 rounded-full border px-4 py-1.5 text-xs font-medium transition-colors disabled:opacity-30"
            >
              {pt("next")} <ChevronRight className="size-3.5" />
            </button>
          </nav>
        )}
      </Container>
    </section>
  );
}
