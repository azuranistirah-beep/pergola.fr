"use client";

import { useTranslations } from "next-intl";
import { CreditCard, Lock, Truck, Shield } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/features/cart/cart-store";
import { formatEUR } from "@/lib/utils";

export default function CheckoutPage() {
  const t = useTranslations("checkout");
  const { lines, subtotalCents, count } = useCart();
  const shippingCents = subtotalCents > 200000 ? 0 : 14900;
  const taxCents = Math.round((subtotalCents + shippingCents) * 0.2);
  const totalCents = subtotalCents + shippingCents;

  return (
    <div className="pt-28 pb-24 md:pt-32">
      <Container>
        <Eyebrow>{t("eyebrow")}</Eyebrow>
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
          {t("title")}
        </h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <form className="space-y-10">
            <section>
              <h2 className="font-serif text-xl">{t("step1")}</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label={t("firstName")} name="first" required />
                <Field label={t("lastName")} name="last" required />
                <Field label={t("email")} type="email" name="email" required />
                <Field label={t("phone")} type="tel" name="phone" required />
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl">{t("step2")}</h2>
              <div className="mt-6 grid gap-5">
                <Field label={t("street")} name="street" required />
                <Field label={t("street2")} name="street2" />
                <div className="grid gap-5 md:grid-cols-[1fr_2fr_2fr]">
                  <Field label={t("postal")} name="postal" required />
                  <Field label={t("city")} name="city" required />
                  <Field
                    label={t("country")}
                    name="country"
                    defaultValue={t("countryDefault")}
                  />
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl">{t("step3")}</h2>
              <div className="mt-6 space-y-3">
                {[
                  { code: "standard", label: t("shippingStandard"), price: shippingCents },
                  { code: "express", label: t("shippingExpress"), price: 29900 },
                  { code: "poseur", label: t("shippingWithPose"), price: 149000 },
                ].map((opt, i) => (
                  <label
                    key={opt.code}
                    className="border-border flex cursor-pointer items-center justify-between rounded-2xl border p-5 has-[input:checked]:border-primary"
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="shipping"
                        defaultChecked={i === 0}
                        className="accent-primary"
                      />
                      <span className="text-sm font-medium">{opt.label}</span>
                    </div>
                    <span className="text-sm">
                      {opt.price === 0 ? (
                        <span className="text-accent">Offert</span>
                      ) : (
                        formatEUR(opt.price)
                      )}
                    </span>
                  </label>
                ))}
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl">{t("step4")}</h2>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  { code: "card", label: t("paymentCard"), helper: t("paymentCardHelper") },
                  { code: "paypal", label: t("paymentPaypal"), helper: t("paymentPaypalHelper") },
                  { code: "sepa", label: t("paymentSepa"), helper: t("paymentSepaHelper") },
                ].map((m, i) => (
                  <label
                    key={m.code}
                    className="border-border flex cursor-pointer flex-col gap-1 rounded-2xl border p-5 has-[input:checked]:border-primary"
                  >
                    <input
                      type="radio"
                      name="payment"
                      defaultChecked={i === 0}
                      className="accent-primary self-start"
                    />
                    <span className="mt-2 text-sm font-medium">{m.label}</span>
                    <span className="text-secondary text-xs">{m.helper}</span>
                  </label>
                ))}
              </div>
              <div className="text-secondary mt-6 flex items-center gap-2 text-xs">
                <Lock className="text-accent size-3.5" />
                {t("encryptedNotice")}
              </div>
            </section>

            <Button asChild variant="primary" size="lg" className="w-full">
              <Link href="/commande/confirmation">
                <CreditCard className="size-4" /> {t("payCta")}{" "}
                {formatEUR(totalCents)}
              </Link>
            </Button>
          </form>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="bg-muted rounded-[var(--radius-lg)] p-6">
              <h2 className="font-serif text-lg">
                {t("summary")}{" "}
                {count > 0 && `— ${count} ${count > 1 ? t("articlePlural") : t("articleSingular")}`}
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                {lines.length === 0 ? (
                  <p className="text-secondary text-sm">{t("cartEmpty")}</p>
                ) : (
                  lines.map((l) => (
                    <div
                      key={l.id}
                      className="flex justify-between gap-3 text-xs"
                    >
                      <span className="min-w-0 truncate">
                        {l.quantity}× {l.name}
                      </span>
                      <span className="whitespace-nowrap">
                        {formatEUR(l.unitPriceCents * l.quantity)}
                      </span>
                    </div>
                  ))
                )}
              </div>
              <dl className="border-border mt-6 space-y-2 border-t pt-4 text-sm">
                <Row
                  label={t("subtotalHt")}
                  value={formatEUR(
                    subtotalCents - Math.round((subtotalCents * 0.2) / 1.2),
                  )}
                />
                <Row label={t("vat")} value={formatEUR(taxCents)} />
                <Row
                  label={t("shipping" as const)}
                  value={
                    shippingCents === 0
                      ? t("cartEmpty") && "Offert"
                      : formatEUR(shippingCents)
                  }
                />
                <div className="border-border flex justify-between border-t pt-3">
                  <dt className="font-medium">{t("totalTtc")}</dt>
                  <dd className="font-serif text-2xl">
                    {formatEUR(totalCents)}
                  </dd>
                </div>
              </dl>
              <ul className="text-secondary mt-6 space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Truck className="text-accent size-3.5" /> {t("freeShipping")}
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="text-accent size-3.5" /> {t("warranty")}
                </li>
              </ul>
            </div>
          </aside>
        </div>
      </Container>
    </div>
  );
}

function Field({
  label,
  name,
  type = "text",
  required,
  defaultValue,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
}) {
  return (
    <div className="flex flex-col gap-2">
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
        className="border-border focus:border-primary bg-transparent border-b py-3 text-sm outline-none"
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-secondary">{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}
