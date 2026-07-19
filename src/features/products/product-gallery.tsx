"use client";

import * as React from "react";
import { ProductImage } from "@/components/ui/product-image";
import { galleryFor } from "@/lib/imagery";
import { cn } from "@/lib/utils";
import type { PergolaProduct } from "./types";

export function ProductGallery({ product }: { product: PergolaProduct }) {
  const images = React.useMemo(() => {
    const urls = galleryFor(product.slug, product.family, 4);
    return urls.map((src, i) => ({
      src,
      alt:
        i === 0
          ? `${product.name} — vue principale`
          : `${product.name} — inspiration ${i}`,
    }));
  }, [product]);

  const [active, setActive] = React.useState(0);
  const current = images[active] ?? images[0]!;

  return (
    <div className="flex flex-col-reverse gap-4 md:flex-row">
      <div className="flex flex-row gap-3 md:flex-col">
        {images.map((img, i) => (
          <button
            key={i}
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
