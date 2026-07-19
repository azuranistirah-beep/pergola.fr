import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Award, Leaf, Truck } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useApi, formatEUR } from "../lib/api.js";

const FEATURES = [
  { icon: Leaf, key_fr: "Éco-conçu", key_en: "Eco-designed", desc_fr: "Aluminium recyclable, peinture sans solvant.", desc_en: "Recyclable aluminum, solvent-free paint." },
  { icon: Award, key_fr: "Garantie 10 ans", key_en: "10-year warranty", desc_fr: "Sur la structure des modèles bioclimatiques.", desc_en: "On the structure of bioclimatic models." },
  { icon: Truck, key_fr: "Livraison France", key_en: "France delivery", desc_fr: "Livraison offerte dès 2 500 €.", desc_en: "Free delivery over €2,500." },
];

export default function HomePage() {
  const { t, locale } = useI18n();
  const { data: featured } = useApi("/api/products?featured=1", []);
  return (
    <>
      <section className="hero">
        <div className="shell hero-inner">
          <p className="eyebrow">{t("hero.eyebrow")}</p>
          <h1>{t("hero.title")}</h1>
          <p className="hero-copy">{t("hero.subtitle")}</p>
          <div className="hero-actions">
            <Link className="button button--primary" to="/catalogue">
              {t("hero.cta_primary")} <ArrowRight size={16} />
            </Link>
            <Link className="button button--ghost" to="/contact">
              {t("hero.cta_secondary")}
            </Link>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="shell features-grid">
          {FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <div className="feature-card" key={f.key_fr}>
                <Icon size={20} />
                <h3>{locale === "en" ? f.key_en : f.key_fr}</h3>
                <p>{locale === "en" ? f.desc_en : f.desc_fr}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="section">
        <div className="shell section-head">
          <h2>{locale === "en" ? "Featured pergolas" : "Pergolas à la une"}</h2>
          <Link to="/catalogue" className="link">
            {t("catalog.title")} <ArrowRight size={14} />
          </Link>
        </div>
        <div className="shell product-grid">
          {(featured || []).map((p) => (
            <Link className="product-card" to={`/produit/${p.slug}`} key={p.id}>
              <div className="product-card__img">
                {p.images?.[0] ? <img src={p.images[0].url} alt={p.images[0].alt || p.name} /> : <div className="ph" />}
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
    </>
  );
}
