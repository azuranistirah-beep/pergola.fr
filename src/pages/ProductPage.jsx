import React, { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Check, ShoppingBag, Truck } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useApi, formatEUR } from "../lib/api.js";
import { useCart } from "../lib/cart.jsx";

export default function ProductPage() {
  const { slug } = useParams();
  const { t, locale } = useI18n();
  const { data: product, loading } = useApi(`/api/products/${slug}`, null);
  const { add } = useCart();
  const nav = useNavigate();
  const [qty, setQty] = useState(1);

  if (loading && !product) return <div className="shell" style={{ padding: 60 }}>…</div>;
  if (!product) {
    return (
      <div className="shell" style={{ padding: 60 }}>
        <h2>404</h2>
        <Link to="/catalogue" className="link"><ArrowLeft size={14} /> {t("catalog.title")}</Link>
      </div>
    );
  }

  function addToCart() {
    add(product, qty);
    nav("/panier");
  }

  return (
    <section className="section">
      <div className="shell product-detail">
        <div className="product-detail__media">
          {product.images?.[0] ? (
            <img src={product.images[0].url} alt={product.images[0].alt || product.name} />
          ) : (
            <div className="ph ph--tall" />
          )}
        </div>
        <div className="product-detail__info">
          <Link to="/catalogue" className="link" style={{ marginBottom: 12 }}>
            <ArrowLeft size={14} /> {t("catalog.title")}
          </Link>
          {product.category && <span className="cat-tag">{product.category.name}</span>}
          <h1>{product.name}</h1>
          <p className="lead">{product.short_desc}</p>
          <div className="price-row">
            <strong>{formatEUR(product.price_cents, locale)}</strong>
            {product.compare_at_cents && (
              <span className="strike">{formatEUR(product.compare_at_cents, locale)}</span>
            )}
          </div>
          <p className={product.in_stock ? "stock ok" : "stock oos"}>
            {product.in_stock ? (
              <><Check size={14} /> {t("product.in_stock")}</>
            ) : (
              t("product.out_of_stock")
            )}
          </p>
          <div className="qty-row">
            <input
              type="number"
              min={1}
              value={qty}
              onChange={(e) => setQty(Math.max(1, parseInt(e.target.value || 1, 10)))}
            />
            <button
              type="button"
              className="button button--primary"
              disabled={!product.in_stock}
              onClick={addToCart}
            >
              <ShoppingBag size={16} /> {t("product.add_to_cart")}
            </button>
          </div>
          <p className="ship-hint">
            <Truck size={14} /> {t("product.shipping_info")}
          </p>
          {product.specs && Object.keys(product.specs).length > 0 && (
            <div className="specs">
              <h3>{t("product.specifications")}</h3>
              <dl>
                {Object.entries(product.specs).map(([k, v]) => (
                  <React.Fragment key={k}>
                    <dt>{k.replace(/_/g, " ")}</dt>
                    <dd>{String(v)}</dd>
                  </React.Fragment>
                ))}
              </dl>
            </div>
          )}
          {product.description && (
            <div className="prose">
              <p>{product.description}</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
