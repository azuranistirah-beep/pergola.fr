# pergolafr.com

E-commerce Vite + React + Postgres pour la vente de pergolas premium (FR + EN).

## Stack

- **Vite 8** + **React 19** + **react-router-dom 7**
- **Postgres 16** via Docker Compose (port `55433`, Adminer sur `58081`)
- **API middleware** intégré au serveur Vite (`server/api.js`)
- **i18n** FR/EN via context provider (`src/i18n/`)
- **Cart** persistant via `localStorage` (`src/lib/cart.jsx`)
- Prix en centimes EUR, formaté avec `Intl.NumberFormat`

## Structure

```
src/
├── main.jsx                    (Router + providers)
├── styles.css                  (design system light warm)
├── i18n/
│   ├── I18nProvider.jsx        (context + LS persistence)
│   └── translations.js         (FR + EN keys)
├── lib/
│   ├── api.js                  (useApi hook + formatEUR)
│   └── cart.jsx                (CartProvider)
├── components/
│   └── Layout.jsx              (Header + Footer)
└── pages/
    ├── HomePage.jsx
    ├── CatalogPage.jsx
    ├── ProductPage.jsx
    ├── CartPage.jsx
    ├── CheckoutPage.jsx        (placeholder Stripe)
    ├── ContactPage.jsx
    └── StaticPage.jsx          (page CMS bilingue)

server/
└── api.js                      (Vite middleware + Postgres)

Postgres/
├── migrations/001_initial_schema.sql
└── seeds/001_seed.sql
```

## Démarrage

```bash
cp .env.example .env             # déjà fait
npm install                      # installer les dépendances
npm run db:up                    # démarrer Postgres + Adminer (OrbStack)
npm run db:migrate               # créer les tables
npm run db:seed                  # insérer les données de démo
npm run dev                      # démarrer sur http://localhost:5173
```

## Base de données

**Schéma e-commerce complet :**
- `categories` (arbre, bilingue)
- `products` (bilingue, images JSONB, specs JSONB, prix en centimes)
- `product_variants` (taille / couleur / matériau)
- `customers`, `addresses`
- `carts`, `cart_items` (server-side optional)
- `orders`, `order_items` (avec snapshots)
- `discount_codes`
- `pages` (contenu CMS bilingue)
- `contacts`, `site_settings`
- `admin_users` (bcrypt + role)

**Données de démo incluses :**
- 4 catégories (Bioclimatiques / À toile / Adossées / Accessoires)
- 4 produits
- 3 pages CMS (À propos / Livraison / Garantie)
- Settings (brand, contact, shipping, tax)

## API

Localisation via query `?locale=fr` ou `?locale=en`.

- `GET /api/site-settings`
- `GET /api/categories?locale=…`
- `GET /api/products?locale=…&category=slug&featured=1`
- `GET /api/products/:slug?locale=…`
- `GET /api/pages/:slug?locale=…`
- `POST /api/contact`

## À faire (roadmap)

- [ ] **Stripe checkout** — intégrer `stripe` package, créer session sur `POST /api/checkout`, webhook pour marquer commande `paid`
- [ ] **Emails transactionnels** — confirmation commande via Resend/SendGrid
- [ ] **Auth client** — session bcrypt (comme okkarhys), page login/register/mon-compte
- [ ] **Admin CMS** — copier le pattern de `okkarhys/src/admin/` pour gérer produits/commandes/pages
- [ ] **Media library** — upload images produits via formidable
- [ ] **SEO** — meta dynamique par produit, JSON-LD Product, sitemap XML
- [ ] **Recherche** — Postgres full-text ou Meilisearch
- [ ] **Discount codes** — appliquer sur checkout
- [ ] **Variantes** — sélecteur taille/couleur dans ProductPage
- [ ] **Images produits** — remplacer placeholders (les `/uploads/placeholder-*.jpg` n'existent pas encore)

## Notes

- Le port Postgres est **55433** (okkarhys utilise 55432, pas de collision).
- Adminer sur **58081** (okkarhys utilise 58080).
- `.env` est ignoré par git ; `.env.example` sert de référence.
- Le stack respecte le pattern de okkarhys.com pour cohérence.
