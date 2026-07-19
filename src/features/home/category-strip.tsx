"use client";

import * as React from "react";
import { catalog } from "@/features/products/catalog";
import { ProductCard } from "@/features/products/product-card";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { cn } from "@/lib/utils";
import type {
  PergolaProduct,
  ProductCategory,
} from "@/features/products/types";

interface CategoryDef {
  code: "all" | ProductCategory;
  label: string;
  helper?: string;
}

const categories: CategoryDef[] = [
  { code: "all", label: "Toutes nos pergolas" },
  { code: "pergola-bois", label: "Bois cèdre" },
  { code: "pergola-lame-orientable", label: "Lames orientables" },
  { code: "pergola-adossee", label: "Adossée mur" },
  { code: "pergola-aluminium", label: "Voile d'ombrage" },
  { code: "pergola-cabana", label: "Cabana d'angle" },
];

export function CategoryStrip() {
  const [active, setActive] = React.useState<CategoryDef["code"]>("all");

  const products = React.useMemo<PergolaProduct[]>(() => {
    if (active === "all") return catalog;
    return catalog.filter((p) => p.category === active);
  }, [active]);

  return (
    <section id="collection" className="scroll-mt-24 py-16 md:py-24">
      <Container>
        <div className="mb-10 flex flex-col justify-between gap-6 md:mb-14 md:flex-row md:items-end">
          <div>
            <Eyebrow>La collection 2026</Eyebrow>
            <h2 className="mt-4 max-w-2xl font-serif text-4xl leading-tight md:text-6xl">
              Chaque pergola, une pièce singulière.
            </h2>
          </div>
          <p className="text-secondary max-w-md text-sm md:text-right">
            29 modèles, du cèdre massif au bioclimatique à lames orientables —
            tous fabriqués sur commande, livrés en 4 à 6 semaines.
          </p>
        </div>

        {/* Category chips */}
        <div className="border-border/60 mb-10 flex flex-wrap items-center gap-2 border-b pb-6">
          {categories.map((c) => {
            const count =
              c.code === "all"
                ? catalog.length
                : catalog.filter((p) => p.category === c.code).length;
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
                {c.label}
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
          {products.length} produit{products.length > 1 ? "s" : ""}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.slug} product={p} />
          ))}
        </div>
      </Container>
    </section>
  );
}
