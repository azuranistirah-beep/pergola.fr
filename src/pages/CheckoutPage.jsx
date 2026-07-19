import React, { useState } from "react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useCart } from "../lib/cart.jsx";
import { formatEUR } from "../lib/api.js";

export default function CheckoutPage() {
  const { t, locale } = useI18n();
  const { cart, totals } = useCart();
  const [form, setForm] = useState({
    email: "",
    first_name: "",
    last_name: "",
    line1: "",
    city: "",
    postal_code: "",
    country_code: "FR",
    phone: "",
  });
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <section className="section">
      <div className="shell page-head">
        <h1>{t("checkout.title")}</h1>
      </div>
      <div className="shell checkout-layout">
        <form className="checkout-form" onSubmit={(e) => { e.preventDefault(); alert("TODO: integrasi Stripe"); }}>
          <h3>{t("checkout.shipping_address")}</h3>
          <div className="grid-2">
            <input placeholder={t("contact.email")} type="email" required value={form.email} onChange={(e) => set("email", e.target.value)} />
            <input placeholder={t("contact.phone")} value={form.phone} onChange={(e) => set("phone", e.target.value)} />
            <input placeholder={t("contact.name")} required value={form.first_name} onChange={(e) => set("first_name", e.target.value)} />
            <input placeholder={locale === "fr" ? "Nom" : "Last name"} required value={form.last_name} onChange={(e) => set("last_name", e.target.value)} />
            <input placeholder={locale === "fr" ? "Adresse" : "Address"} required className="wide" value={form.line1} onChange={(e) => set("line1", e.target.value)} />
            <input placeholder={locale === "fr" ? "Code postal" : "Postal code"} required value={form.postal_code} onChange={(e) => set("postal_code", e.target.value)} />
            <input placeholder={locale === "fr" ? "Ville" : "City"} required value={form.city} onChange={(e) => set("city", e.target.value)} />
          </div>
          <button type="submit" className="button button--primary" style={{ marginTop: 16 }}>
            {t("checkout.place_order")}
          </button>
          <p className="hint">
            {locale === "fr"
              ? "Le paiement Stripe sera activé lors du branchement des clés API dans .env."
              : "Stripe checkout will activate once API keys are set in .env."}
          </p>
        </form>
        <aside className="cart-summary">
          {cart.items.map((i) => (
            <div className="row" key={i.key}>
              <span>{i.name} × {i.quantity}</span>
              <strong>{formatEUR(i.unit_price_cents * i.quantity, locale)}</strong>
            </div>
          ))}
          <div className="row total">
            <span>{t("cart.total")}</span>
            <strong>{formatEUR(totals.subtotal, locale)}</strong>
          </div>
        </aside>
      </div>
    </section>
  );
}
