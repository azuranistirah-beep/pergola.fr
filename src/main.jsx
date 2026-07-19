import React from "react";
import { createRoot } from "react-dom/client";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { I18nProvider } from "./i18n/I18nProvider.jsx";
import { CartProvider } from "./lib/cart.jsx";
import Layout from "./components/Layout.jsx";
import HomePage from "./pages/HomePage.jsx";
import CatalogPage from "./pages/CatalogPage.jsx";
import ProductPage from "./pages/ProductPage.jsx";
import CartPage from "./pages/CartPage.jsx";
import CheckoutPage from "./pages/CheckoutPage.jsx";
import ContactPage from "./pages/ContactPage.jsx";
import StaticPage from "./pages/StaticPage.jsx";
import "./styles.css";

function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<Layout />}>
              <Route path="/" element={<HomePage />} />
              <Route path="/catalogue" element={<CatalogPage />} />
              <Route path="/produit/:slug" element={<ProductPage />} />
              <Route path="/panier" element={<CartPage />} />
              <Route path="/commande" element={<CheckoutPage />} />
              <Route path="/contact" element={<ContactPage />} />
              <Route path="/pages/:slug" element={<StaticPage />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </I18nProvider>
  );
}

createRoot(document.getElementById("root")).render(<App />);
