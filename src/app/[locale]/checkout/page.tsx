"use client";

import { CreditCard, Lock, Truck, Shield } from "lucide-react";
import { Container } from "@/components/ui/container";
import { Eyebrow } from "@/components/ui/eyebrow";
import { Button } from "@/components/ui/button";
import { Link } from "@/i18n/navigation";
import { useCart } from "@/features/cart/cart-store";
import { formatEUR } from "@/lib/utils";

export default function CheckoutPage() {
  const { lines, subtotalCents, count } = useCart();
  const shippingCents = subtotalCents > 200000 ? 0 : 14900;
  const taxCents = Math.round((subtotalCents + shippingCents) * 0.2);
  const totalCents = subtotalCents + shippingCents;

  return (
    <div className="pt-28 pb-24 md:pt-32">
      <Container>
        <Eyebrow>Commande</Eyebrow>
        <h1 className="mt-4 font-serif text-4xl leading-tight md:text-5xl">
          Finaliser votre commande
        </h1>

        <div className="mt-12 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
          <form className="space-y-10">
            <section>
              <h2 className="font-serif text-xl">1. Coordonnées</h2>
              <div className="mt-6 grid gap-5 md:grid-cols-2">
                <Field label="Prénom" name="first" required />
                <Field label="Nom" name="last" required />
                <Field label="Email" type="email" name="email" required />
                <Field label="Téléphone" type="tel" name="phone" required />
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl">2. Adresse de livraison</h2>
              <div className="mt-6 grid gap-5">
                <Field label="Adresse" name="street" required />
                <Field label="Complément (optionnel)" name="street2" />
                <div className="grid gap-5 md:grid-cols-[1fr_2fr_2fr]">
                  <Field label="Code postal" name="postal" required />
                  <Field label="Ville" name="city" required />
                  <Field label="Pays" name="country" defaultValue="France" />
                </div>
              </div>
            </section>

            <section>
              <h2 className="font-serif text-xl">3. Livraison</h2>
              <div className="mt-6 space-y-3">
                {[
                  { code: "standard", label: "Standard — 4 à 6 semaines", price: shippingCents },
                  { code: "express", label: "Express — 3 semaines", price: 29900 },
                  { code: "poseur", label: "Livraison + pose (RDV équipe)", price: 149000 },
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
              <h2 className="font-serif text-xl">4. Paiement</h2>
              <div className="mt-6 grid gap-3 md:grid-cols-3">
                {[
                  { code: "card", label: "Carte", helper: "Visa, Mastercard, Amex" },
                  { code: "paypal", label: "PayPal", helper: "Compte PayPal" },
                  { code: "sepa", label: "Virement SEPA", helper: "Sans frais" },
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
                Paiement chiffré SSL. Aucune donnée bancaire n&apos;est stockée.
              </div>
            </section>

            <Button asChild variant="primary" size="lg" className="w-full">
              <Link href="/commande/confirmation">
                <CreditCard className="size-4" /> Payer {formatEUR(totalCents)}
              </Link>
            </Button>
          </form>

          <aside className="lg:sticky lg:top-32 lg:self-start">
            <div className="bg-muted rounded-[var(--radius-lg)] p-6">
              <h2 className="font-serif text-lg">
                Récapitulatif {count > 0 && `— ${count} article${count > 1 ? "s" : ""}`}
              </h2>
              <div className="mt-4 space-y-3 text-sm">
                {lines.length === 0 ? (
                  <p className="text-secondary text-sm">Panier vide.</p>
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
                <Row label="Sous-total HT" value={formatEUR(subtotalCents - Math.round(subtotalCents * 0.2 / 1.2))} />
                <Row label="TVA 20%" value={formatEUR(taxCents)} />
                <Row
                  label="Livraison"
                  value={
                    shippingCents === 0
                      ? "Offerte"
                      : formatEUR(shippingCents)
                  }
                />
                <div className="border-border flex justify-between border-t pt-3">
                  <dt className="font-medium">Total TTC</dt>
                  <dd className="font-serif text-2xl">
                    {formatEUR(totalCents)}
                  </dd>
                </div>
              </dl>
              <ul className="text-secondary mt-6 space-y-2 text-xs">
                <li className="flex items-center gap-2">
                  <Truck className="text-accent size-3.5" /> Livraison France
                  offerte dès 2 000 €
                </li>
                <li className="flex items-center gap-2">
                  <Shield className="text-accent size-3.5" /> Garantie 10 ans
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
