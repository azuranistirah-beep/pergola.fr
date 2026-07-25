"use client";

import { useTranslations } from "next-intl";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";
import { Link } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Button } from "@/components/ui/button";
import { Eyebrow } from "@/components/ui/eyebrow";
import { useCart } from "@/features/cart/cart-store";
import { formatEUR } from "@/lib/utils";

export default function PanierPage() {
  const t = useTranslations("cart");
  const { lines, remove, setQuantity, subtotalCents, clear } = useCart();
  const shippingCents = subtotalCents > 200000 ? 0 : 14900;
  const totalCents = subtotalCents + shippingCents;

  return (
    <div className="pt-24 pb-16 md:pt-32 md:pb-24">
      <Container>
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="mt-4 font-serif text-3xl leading-tight md:text-6xl">
          {t("title")}
        </h1>

        {lines.length === 0 ? (
          <div className="mt-16 flex flex-col items-center gap-6 py-24 text-center">
            <div className="bg-muted text-secondary flex size-16 items-center justify-center rounded-full">
              <ShoppingBag className="size-6" />
            </div>
            <p className="text-secondary">{t("empty")}</p>
            <Button asChild variant="primary" size="lg">
              <Link href="/pergolas">
                {t("emptyCta")} <ArrowRight />
              </Link>
            </Button>
          </div>
        ) : (
          <div className="mt-12 grid gap-10 lg:grid-cols-[1.6fr_1fr]">
            <div className="border-border overflow-hidden rounded-[var(--radius-lg)] border">
              {lines.map((l, i) => (
                <div
                  key={l.id}
                  className={`flex gap-3 p-4 md:gap-6 md:p-8 ${i > 0 ? "border-t border-border" : ""}`}
                >
                  <div className="bg-muted relative aspect-square w-20 shrink-0 overflow-hidden rounded-2xl md:w-32">
                    {l.imageUrl && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={l.imageUrl}
                        alt={l.name}
                        className="absolute inset-0 h-full w-full object-cover"
                      />
                    )}
                  </div>
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="font-serif text-lg leading-tight">
                        {l.name}
                      </h3>
                      <div className="text-secondary mt-1 font-mono text-xs">
                        {l.sku}
                      </div>
                    </div>
                    <div className="mt-4 flex items-center justify-between gap-4">
                      <div className="border-border inline-flex items-center rounded-full border">
                        <button
                          onClick={() => setQuantity(l.id, l.quantity - 1)}
                          className="px-3 py-1.5 text-sm"
                          aria-label={t("quantityDown")}
                        >
                          −
                        </button>
                        <span className="px-3 text-sm">{l.quantity}</span>
                        <button
                          onClick={() => setQuantity(l.id, l.quantity + 1)}
                          className="px-3 py-1.5 text-sm"
                          aria-label={t("quantityUp")}
                        >
                          +
                        </button>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-serif text-lg">
                          {formatEUR(l.unitPriceCents * l.quantity)}
                        </span>
                        <button
                          onClick={() => remove(l.id)}
                          aria-label={t("removeLine")}
                          className="text-secondary hover:text-primary"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              <div className="bg-muted flex items-center justify-between p-4 text-xs">
                <button
                  onClick={clear}
                  className="text-secondary hover:text-primary underline underline-offset-4"
                >
                  {t("clear")}
                </button>
                <Link
                  href="/pergolas"
                  className="text-primary font-medium underline underline-offset-4"
                >
                  {t("continue")}
                </Link>
              </div>
            </div>

            <aside className="lg:sticky lg:top-32 lg:self-start">
              <div className="border-border rounded-[var(--radius-lg)] border p-8">
                <h2 className="font-serif text-xl">{t("summary")}</h2>
                <dl className="mt-6 space-y-3 text-sm">
                  <div className="flex justify-between">
                    <dt className="text-secondary">{t("subtotal")}</dt>
                    <dd>{formatEUR(subtotalCents)}</dd>
                  </div>
                  <div className="flex justify-between">
                    <dt className="text-secondary">{t("shipping")}</dt>
                    <dd>
                      {shippingCents === 0 ? (
                        <span className="text-accent">
                          {t("shippingFree")}
                        </span>
                      ) : (
                        formatEUR(shippingCents)
                      )}
                    </dd>
                  </div>
                  <div className="border-border flex justify-between border-t pt-4 text-base">
                    <dt className="font-medium">{t("total")}</dt>
                    <dd className="font-serif text-2xl">
                      {formatEUR(totalCents)}
                    </dd>
                  </div>
                </dl>
                <Button
                  asChild
                  variant="primary"
                  size="lg"
                  className="mt-6 w-full"
                >
                  <Link href="/checkout">
                    {t("checkoutCta")} <ArrowRight />
                  </Link>
                </Button>
                <p className="text-secondary mt-4 text-center text-xs">
                  {t("secure")}
                </p>
              </div>
            </aside>
          </div>
        )}
      </Container>
    </div>
  );
}
