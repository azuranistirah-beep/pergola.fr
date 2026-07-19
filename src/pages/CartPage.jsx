import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Trash2 } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useCart } from "../lib/cart.jsx";
import { useApi, formatEUR } from "../lib/api.js";

export default function CartPage() {
  const { t, locale } = useI18n();
  const { cart, remove, setQty, totals } = useCart();
  const { data: settings } = useApi("/api/site-settings", {});
  const freeFrom = settings?.shipping?.free_from_cents ?? 250000;
  const stdShip = settings?.shipping?.standard_cents ?? 9900;
  const shipping = totals.subtotal >= freeFrom || cart.items.length === 0 ? 0 : stdShip;
  const total = totals.subtotal + shipping;

  if (cart.items.length === 0) {
    return (
      <section className="section">
        <div className="shell page-head">
          <h1>{t("cart.title")}</h1>
        </div>
        <div className="shell empty-state">
          <p>{t("cart.empty")}</p>
          <Link to="/catalogue" className="button button--primary">
            {t("cart.continue_shopping")} <ArrowRight size={14} />
          </Link>
        </div>
      </section>
    );
  }

  return (
    <section className="section">
      <div className="shell page-head">
        <h1>{t("cart.title")}</h1>
      </div>
      <div className="shell cart-layout">
        <div className="cart-items">
          {cart.items.map((i) => (
            <div className="cart-row" key={i.key}>
              <div className="cart-row__img">
                {i.image ? <img src={i.image} alt={i.name} /> : <div className="ph" />}
              </div>
              <div className="cart-row__body">
                <Link to={`/produit/${i.slug}`}><strong>{i.name}</strong></Link>
                <span>{formatEUR(i.unit_price_cents, locale)}</span>
              </div>
              <input
                type="number"
                min={1}
                value={i.quantity}
                onChange={(e) => setQty(i.key, parseInt(e.target.value || 1, 10))}
              />
              <strong>{formatEUR(i.unit_price_cents * i.quantity, locale)}</strong>
              <button
                type="button"
                className="icon-btn"
                onClick={() => remove(i.key)}
                aria-label={t("cart.remove")}
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))}
        </div>

        <aside className="cart-summary">
          <div className="row"><span>{t("cart.subtotal")}</span><strong>{formatEUR(totals.subtotal, locale)}</strong></div>
          <div className="row">
            <span>{t("cart.shipping")}</span>
            <strong>{shipping === 0 ? t("cart.free") : formatEUR(shipping, locale)}</strong>
          </div>
          <div className="row total">
            <span>{t("cart.total")}</span>
            <strong>{formatEUR(total, locale)}</strong>
          </div>
          <Link to="/commande" className="button button--primary" style={{ justifyContent: "center", width: "100%", marginTop: 8 }}>
            {t("cart.checkout")} <ArrowRight size={14} />
          </Link>
        </aside>
      </div>
    </section>
  );
}
