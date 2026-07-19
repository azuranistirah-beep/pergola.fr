import React from "react";
import { Link, NavLink, Outlet } from "react-router-dom";
import { Globe, ShoppingBag } from "lucide-react";
import { useI18n } from "../i18n/I18nProvider.jsx";
import { useCart } from "../lib/cart.jsx";

function Header() {
  const { t, locale, setLocale } = useI18n();
  const { totals } = useCart();
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" to="/">
          <span className="brand-mark">P</span>
          <strong>pergolafr</strong>
        </Link>
        <nav className="nav-links">
          <NavLink to="/" end>{t("nav.home")}</NavLink>
          <NavLink to="/catalogue">{t("nav.catalog")}</NavLink>
          <NavLink to="/pages/a-propos">{t("nav.about")}</NavLink>
          <NavLink to="/pages/livraison">{t("nav.delivery")}</NavLink>
          <NavLink to="/pages/garantie">{t("nav.warranty")}</NavLink>
          <NavLink to="/contact">{t("nav.contact")}</NavLink>
        </nav>
        <div className="header-actions">
          <button
            type="button"
            className="lang-toggle"
            onClick={() => setLocale(locale === "fr" ? "en" : "fr")}
            aria-label="Change language"
          >
            <Globe size={16} />
            <span>{locale.toUpperCase()}</span>
          </button>
          <Link className="cart-link" to="/panier">
            <ShoppingBag size={18} />
            <span>{t("nav.cart")}</span>
            {totals.count > 0 && <em>{totals.count}</em>}
          </Link>
        </div>
      </div>
    </header>
  );
}

function Footer() {
  const { t } = useI18n();
  const year = new Date().getFullYear();
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <span>© {year} Pergola FR · {t("footer.rights")}</span>
        <span>{t("footer.made_in")} 🇫🇷</span>
      </div>
    </footer>
  );
}

export default function Layout() {
  return (
    <>
      <Header />
      <main>
        <Outlet />
      </main>
      <Footer />
    </>
  );
}
