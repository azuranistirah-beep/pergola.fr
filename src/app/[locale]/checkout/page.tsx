"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { ArrowRight, Check, Loader2, ShoppingBag } from "lucide-react";
import { Link, useRouter } from "@/i18n/navigation";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { useCart } from "@/features/cart/cart-store";
import { formatEUR } from "@/lib/utils";
import { submitQuoteRequest } from "@/actions/public-actions";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const locale = useLocale();
  const router = useRouter();
  const { lines, subtotalCents, clear } = useCart();

  const [pending, setPending] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (pending) return;
    if (!lines.length) return;
    setError(null);
    setPending(true);
    try {
      const form = new FormData(e.currentTarget);
      const result = await submitQuoteRequest({
        customerName: String(form.get("name") ?? ""),
        customerEmail: String(form.get("email") ?? ""),
        customerPhone: String(form.get("phone") ?? ""),
        shippingAddress: String(form.get("street") ?? ""),
        shippingPostal: String(form.get("postal") ?? ""),
        shippingCity: String(form.get("city") ?? ""),
        shippingCountry: String(form.get("country") ?? "FR"),
        notes: String(form.get("notes") ?? ""),
        locale,
        website: String(form.get("website") ?? ""),
        items: lines.map((l) => ({
          productSlug: l.productSlug,
          productSku: l.sku,
          productName: l.name,
          unitPriceCents: l.unitPriceCents,
          quantity: l.quantity,
          configuration: l.configuration,
        })),
      });
      clear();
      router.push(`/commande/confirmation?ref=${result.orderNumber}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("submitError"));
      setPending(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="pt-28 pb-24 md:pt-32">
        <Container>
          <div className="mx-auto flex max-w-md flex-col items-center gap-6 py-16 text-center">
            <div className="bg-muted text-secondary flex size-16 items-center justify-center rounded-full">
              <ShoppingBag className="size-6" />
            </div>
            <p className="text-secondary">{t("cartEmpty")}</p>
            <Button asChild variant="primary" size="lg">
              <Link href="/pergolas">
                {t("cartEmptyCta")} <ArrowRight />
              </Link>
            </Button>
          </div>
        </Container>
      </div>
    );
  }

  return (
    <div className="pt-28 pb-24 md:pt-32">
      <Container>
        <Eyebrow>{t("quoteEyebrow")}</Eyebrow>
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-6xl">
          {t("quoteTitle")}
        </h1>
        <p className="text-secondary mt-4 max-w-2xl">{t("quoteIntro")}</p>

        <form
          onSubmit={onSubmit}
          className="mt-12 grid gap-10 lg:grid-cols-[1.4fr_1fr]"
        >
          {/* Left: customer details */}
          <div className="space-y-8">
            <div className="border-border rounded-[var(--radius-lg)] border p-6 md:p-8">
              <h2 className="font-serif text-xl">{t("step1")}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  label={t("firstName") + " & " + t("lastName")}
                  name="name"
                  required
                />
                <Field
                  label={t("email")}
                  name="email"
                  type="email"
                  required
                />
                <Field
                  label={t("phone")}
                  name="phone"
                  type="tel"
                />
              </div>
            </div>

            <div className="border-border rounded-[var(--radius-lg)] border p-6 md:p-8">
              <h2 className="font-serif text-xl">{t("step2")}</h2>
              <div className="mt-6 grid gap-4 sm:grid-cols-2">
                <Field
                  className="sm:col-span-2"
                  label={t("street")}
                  name="street"
                />
                <Field label={t("postal")} name="postal" />
                <Field label={t("city")} name="city" />
                <Field
                  label={t("country")}
                  name="country"
                  defaultValue={t("countryDefault")}
                />
              </div>
            </div>

            <div className="border-border rounded-[var(--radius-lg)] border p-6 md:p-8">
              <h2 className="font-serif text-xl">{t("quoteNotesTitle")}</h2>
              <div className="mt-6 flex flex-col gap-2">
                <label
                  htmlFor="notes"
                  className="text-secondary text-[10px] uppercase tracking-[0.25em]"
                >
                  {t("quoteNotesHelper")}
                </label>
                <textarea
                  id="notes"
                  name="notes"
                  rows={4}
                  className="border-border focus:border-primary resize-none border-b bg-transparent py-3 text-sm outline-none"
                />
              </div>
            </div>

            {/* Honeypot */}
            <input
              type="text"
              name="website"
              tabIndex={-1}
              autoComplete="off"
              className="hidden"
              aria-hidden
            />
          </div>

          {/* Right: order summary */}
          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="border-border rounded-[var(--radius-lg)] border p-6 md:p-8">
              <h2 className="font-serif text-xl">{t("summary")}</h2>
              <div className="mt-6 space-y-4">
                {lines.map((l) => (
                  <div
                    key={l.id}
                    className="border-border/60 flex flex-col gap-2 border-b pb-4 last:border-b-0 last:pb-0"
                  >
                    <div className="flex items-baseline justify-between gap-3">
                      <div className="min-w-0">
                        <div className="font-serif text-sm leading-tight">
                          {l.name}
                        </div>
                        <div className="text-secondary mt-0.5 font-mono text-[10px]">
                          {l.sku} · ×{l.quantity}
                        </div>
                      </div>
                      <div className="whitespace-nowrap text-sm">
                        {formatEUR(l.unitPriceCents * l.quantity)}
                      </div>
                    </div>
                    {l.configuration && (
                      <details className="text-secondary text-[11px]">
                        <summary className="cursor-pointer">
                          {t("configurationLabel")}
                        </summary>
                        <dl className="mt-2 space-y-1">
                          {Object.entries(l.configuration).map(([k, v]) => (
                            <div key={k} className="flex justify-between gap-3">
                              <dt className="truncate">{k}</dt>
                              <dd className="text-primary text-right">{v}</dd>
                            </div>
                          ))}
                        </dl>
                      </details>
                    )}
                  </div>
                ))}
              </div>

              <dl className="border-border mt-6 space-y-3 border-t pt-6 text-sm">
                <div className="flex justify-between">
                  <dt className="text-secondary">{t("subtotalHt")}</dt>
                  <dd>{formatEUR(subtotalCents)}</dd>
                </div>
                <div className="border-border flex justify-between border-t pt-4 text-base">
                  <dt className="font-medium">{t("totalTtc")}</dt>
                  <dd className="font-serif text-2xl">
                    {formatEUR(subtotalCents)}
                  </dd>
                </div>
              </dl>

              {error && (
                <div className="mt-4 rounded-md border border-red-200 bg-red-50 p-3 text-xs text-red-700">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                size="lg"
                className="mt-6 w-full"
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="animate-spin" /> {t("quoteSubmitting")}
                  </>
                ) : (
                  <>
                    <Check /> {t("quoteCta")}
                  </>
                )}
              </Button>

              <p className="text-secondary mt-4 text-center text-xs">
                {t("quoteNotice")}
              </p>
            </div>
          </aside>
        </form>
      </Container>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required = false,
  defaultValue,
  className,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  className?: string;
}) {
  return (
    <div className={`flex flex-col gap-2 ${className ?? ""}`}>
      <label
        htmlFor={name}
        className="text-secondary text-[10px] uppercase tracking-[0.25em]"
      >
        {label}
        {required && " *"}
      </label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        className="border-border focus:border-primary border-b bg-transparent py-3 text-sm outline-none"
      />
    </div>
  );
}
