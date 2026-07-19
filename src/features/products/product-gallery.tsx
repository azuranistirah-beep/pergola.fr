"use client";

import * as React from "react";
import { ProductImage } from "@/components/ui/product-image";
import { cn } from "@/lib/utils";
import type { PergolaProduct } from "./types";

export function ProductGallery({ product }: { product: PergolaProduct }) {
  const [active, setActive] = React.useState(0);
  const images = React.useMemo(() => {
    if (product.heroUrl) {
      // Placeholder gallery: repeat the hero URL with varying crop widths so
      // each thumb reads as distinct. Replace with real gallery when the user
      // drops per-slug images under public/images/products/<slug>/.
      const widths = [1600, 1200, 1400];
      return widths.map((w, i) => ({
        src: product.heroUrl!.replace(/width=\d+/, `width=${w}`),
        alt: `${product.name} — vue ${i + 1}`,
      }));
    }
    return Array.from({ length: product.imageCount }, (_, i) => ({
      src: `/images/products/${product.slug}/${i + 1}.jpg`,
      alt: `${product.name} — vue ${i + 1}`,
    }));
  }, [product]);

  const current = images[active] ?? images[0]!;

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <div className="flex flex-row gap-3 md:flex-col">
        {images.map((img, i) => (
          <button
            key={img.src}
            onClick={() => setActive(i)}
            aria-label={`Aperçu ${i + 1}`}
            className={cn(
              "relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl bg-muted transition-all",
              i === active
                ? "ring-accent ring-2 ring-offset-2 ring-offset-background"
                : "opacity-70 hover:opacity-100",
            )}
          >
            <ProductImage
              src={img.src}
              alt={img.alt}
              colorway={product.colorway}
              sizes="80px"
            />
          </button>
        ))}
      </div>
      <div className="relative aspect-[4/5] flex-1 overflow-hidden rounded-[var(--radius-lg)] bg-muted md:aspect-[4/4]">
        <ProductImage
          src={current.src}
          alt={current.alt}
          colorway={product.colorway}
          sizes="(min-width: 1024px) 55vw, 100vw"
          priority
        />
      </div>
    </div>
  );
}
