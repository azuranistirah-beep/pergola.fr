import { ArrowUpRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { ProductImage } from "@/components/ui/product-image";
import { formatEUR } from "@/lib/utils";
import type { PergolaProduct } from "./types";

const materialLabel: Record<PergolaProduct["material"], string> = {
  wood: "Cèdre massif",
  steel: "Acier galvanisé",
  aluminium: "Aluminium",
};

export function ProductCard({ product }: { product: PergolaProduct }) {
  return (
    <Link
      href={`/pergolas/${product.slug}`}
      className="group flex flex-col overflow-hidden rounded-[var(--radius-lg)] bg-background transition-shadow hover:shadow-[var(--shadow-elevated)]"
    >
      <div className="relative aspect-[4/3] overflow-hidden bg-muted">
        <div className="absolute inset-0 transition-transform duration-700 group-hover:scale-105">
          <ProductImage
            src={`/images/products/${product.slug}/cover.jpg`}
            alt={product.name}
            colorway={product.colorway}
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
          />
        </div>
        <div className="absolute right-4 top-4 flex items-center gap-1 rounded-full bg-background/90 px-3 py-1 text-[10px] font-medium uppercase tracking-[0.2em] backdrop-blur">
          {product.widthFt}′ × {product.lengthFt}′
        </div>
      </div>
      <div className="flex flex-1 flex-col justify-between gap-6 p-6">
        <div>
          <div className="text-accent text-[10px] font-medium uppercase tracking-[0.25em]">
            {materialLabel[product.material]}
          </div>
          <h3 className="mt-3 font-serif text-xl leading-tight">
            {product.name}
          </h3>
          <p className="text-secondary mt-2 line-clamp-2 text-sm">
            {product.tagline}
          </p>
        </div>
        <div className="flex items-end justify-between">
          <div>
            <div className="text-secondary text-[10px] uppercase tracking-[0.2em]">
              À partir de
            </div>
            <div className="mt-1 font-serif text-2xl">
              {formatEUR(product.priceCents)}
            </div>
          </div>
          <div className="text-primary flex items-center gap-1 text-xs font-medium">
            Découvrir
            <ArrowUpRight className="size-3.5 transition-transform duration-500 group-hover:translate-x-1 group-hover:-translate-y-1" />
          </div>
        </div>
      </div>
    </Link>
  );
}
