"use client";

import * as React from "react";
import { Check, ShoppingBag } from "lucide-react";
import { useTranslations } from "next-intl";
import { useRouter } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-store";
import type { PergolaProduct } from "./types";

export function PdpAddToCartButton({ product }: { product: PergolaProduct }) {
  const t = useTranslations("pdp");
  const router = useRouter();
  const cart = useCart();
  const [added, setAdded] = React.useState(false);

  function handleAdd() {
    cart.add({
      productSlug: product.slug,
      name: product.name,
      sku: product.sku,
      imageUrl: product.heroUrl,
      unitPriceCents: product.priceCents,
      quantity: 1,
      configuration: {
        Format: `${product.widthFt}' × ${product.lengthFt}'`,
      },
    });
    setAdded(true);
    setTimeout(() => router.push("/panier"), 400);
  }

  return (
    <Button
      variant="accent"
      size="lg"
      className="w-full"
      onClick={handleAdd}
      disabled={added}
    >
      {added ? (
        <>
          <Check /> {t("ctaAdded")}
        </>
      ) : (
        <>
          <ShoppingBag /> {t("ctaAddToCart")}
        </>
      )}
    </Button>
  );
}
