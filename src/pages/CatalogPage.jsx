import React, { useState } from "react";
import { Link } from "react-router-dom";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useApi, formatEUR } from "../lib/api.js";

export default function CatalogPage() {
  const { t, locale } = useI18n();
  const [cat, setCat] = useState("");
  const { data: categories } = useApi("/api/categories", []);
  const { data: products, loading } = useApi(
    cat ? `/api/products?category=${cat}` : "/api/products",
    []
  );

  return (
    <section className="section">
      <div className="shell page-head">
        <h1>{t("catalog.title")}</h1>
        <p>{t("catalog.subtitle")}</p>
      </div>
      <div className="shell filters">
        <button
          className={`chip ${!cat ? "is-active" : ""}`}
          onClick={() => setCat("")}
        >
          {t("catalog.filter_all")}
        </button>
        {(categories || []).map((c) => (
          <button
            key={c.slug}
            className={`chip ${cat === c.slug ? "is-active" : ""}`}
            onClick={() => setCat(c.slug)}
          >
            {c.name}
          </button>
        ))}
      </div>
      <div className="shell product-grid">
        {loading && <div className="loading">…</div>}
        {(products || []).map((p) => (
          <Link className="product-card" to={`/produit/${p.slug}`} key={p.id}>
            <div className="product-card__img">
              {p.images?.[0] ? <img src={p.images[0].url} alt={p.images[0].alt || p.name} /> : <div className="ph" />}
              {!p.in_stock && <span className="oos">{t("catalog.out_of_stock")}</span>}
            </div>
            <div className="product-card__body">
              {p.category && <span className="cat-tag">{p.category.name}</span>}
              <h3>{p.name}</h3>
              <p>{p.short_desc}</p>
              <div className="product-card__foot">
                <strong>{formatEUR(p.price_cents, locale)}</strong>
                {p.compare_at_cents && (
                  <span className="strike">{formatEUR(p.compare_at_cents, locale)}</span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
