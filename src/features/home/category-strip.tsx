"use client";

import * as React from "react";
import { useTranslations } from "next-intl";
import { ProductCard } from "@/features/products/product-card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import type {
  PergolaProduct,
  ProductCategory,
} from "@/features/products/types";

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
  const [active, setActive] = React.useState<"all" | ProductCategory>("all");

  const filtered = React.useMemo(() => {
    if (active === "all") return products;
    return products.filter((p) => p.category === active);
  }, [active, products]);

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

        <div className="text-secondary mb-6 text-xs">
          {t("productsCount", { count: filtered.length })}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filtered.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
