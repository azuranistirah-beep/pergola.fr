-- ============================================================================
-- pergolafr.com — Initial schema (e-commerce)
-- ============================================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "citext";

-- updated_at trigger helper
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ---------------------------------------------------------------------------
-- Categories (hierarchical, bilingual)
-- ---------------------------------------------------------------------------
CREATE TABLE categories (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug         text NOT NULL UNIQUE,
  parent_id    uuid REFERENCES categories(id) ON DELETE SET NULL,
  name_fr      text NOT NULL,
  name_en      text NOT NULL,
  description_fr text,
  description_en text,
  image_url    text,
  sort_order   int  NOT NULL DEFAULT 0,
  is_active    boolean NOT NULL DEFAULT true,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_categories_updated BEFORE UPDATE ON categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Products (bilingual)
-- ---------------------------------------------------------------------------
CREATE TABLE products (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  sku           text UNIQUE,
  category_id   uuid REFERENCES categories(id) ON DELETE SET NULL,
  name_fr       text NOT NULL,
  name_en       text NOT NULL,
  short_desc_fr text,
  short_desc_en text,
  description_fr text,
  description_en text,
  specs         jsonb NOT NULL DEFAULT '{}'::jsonb,
  price_cents   int  NOT NULL DEFAULT 0,           -- price in EUR cents
  compare_at_cents int,                            -- strikethrough price
  currency      text NOT NULL DEFAULT 'EUR',
  stock_qty     int  NOT NULL DEFAULT 0,
  in_stock      boolean GENERATED ALWAYS AS (stock_qty > 0) STORED,
  weight_kg     numeric(10, 3),
  dimensions    jsonb,                             -- { l, w, h in cm }
  images        jsonb NOT NULL DEFAULT '[]'::jsonb, -- [{ url, alt }]
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  is_featured   boolean NOT NULL DEFAULT false,
  sort_order    int  NOT NULL DEFAULT 0,
  published_at  timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_products_status_sort ON products(status, sort_order);
CREATE INDEX idx_products_category ON products(category_id);
CREATE INDEX idx_products_featured ON products(is_featured) WHERE is_featured = true;
CREATE TRIGGER trg_products_updated BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Product variants (size / color / material)
-- ---------------------------------------------------------------------------
CREATE TABLE product_variants (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  sku           text UNIQUE,
  name_fr       text NOT NULL,
  name_en       text NOT NULL,
  attributes    jsonb NOT NULL DEFAULT '{}'::jsonb, -- { size, color, material }
  price_delta_cents int NOT NULL DEFAULT 0,
  stock_qty     int NOT NULL DEFAULT 0,
  sort_order    int NOT NULL DEFAULT 0,
  is_active     boolean NOT NULL DEFAULT true,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_variants_product ON product_variants(product_id);
CREATE TRIGGER trg_variants_updated BEFORE UPDATE ON product_variants
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Customers
-- ---------------------------------------------------------------------------
CREATE TABLE customers (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         citext NOT NULL UNIQUE,
  first_name    text,
  last_name     text,
  phone         text,
  password_hash text,                              -- null for guest checkout
  locale        text NOT NULL DEFAULT 'fr' CHECK (locale IN ('fr','en')),
  marketing_opt_in boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_customers_updated BEFORE UPDATE ON customers
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- ---------------------------------------------------------------------------
-- Addresses
-- ---------------------------------------------------------------------------
CREATE TABLE addresses (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id   uuid REFERENCES customers(id) ON DELETE CASCADE,
  kind          text NOT NULL DEFAULT 'shipping' CHECK (kind IN ('shipping','billing')),
  first_name    text NOT NULL,
  last_name     text NOT NULL,
  company       text,
  line1         text NOT NULL,
  line2         text,
  city          text NOT NULL,
  postal_code   text NOT NULL,
  region        text,
  country_code  text NOT NULL DEFAULT 'FR',
  phone         text,
  is_default    boolean NOT NULL DEFAULT false,
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_addresses_customer ON addresses(customer_id);

-- ---------------------------------------------------------------------------
-- Carts (session-based or customer-based)
-- ---------------------------------------------------------------------------
CREATE TABLE carts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  token         text NOT NULL UNIQUE,             -- opaque token for guest cart
  customer_id   uuid REFERENCES customers(id) ON DELETE SET NULL,
  currency      text NOT NULL DEFAULT 'EUR',
  locale        text NOT NULL DEFAULT 'fr',
  metadata      jsonb NOT NULL DEFAULT '{}'::jsonb,
  expires_at    timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_carts_customer ON carts(customer_id);
CREATE TRIGGER trg_carts_updated BEFORE UPDATE ON carts
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE cart_items (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cart_id       uuid NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id    uuid NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  variant_id    uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  quantity      int NOT NULL DEFAULT 1 CHECK (quantity > 0),
  unit_price_cents int NOT NULL,                  -- snapshot at time of add
  created_at    timestamptz NOT NULL DEFAULT now(),
  UNIQUE (cart_id, product_id, variant_id)
);
CREATE INDEX idx_cart_items_cart ON cart_items(cart_id);

-- ---------------------------------------------------------------------------
-- Orders
-- ---------------------------------------------------------------------------
CREATE TABLE orders (
  id                 uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number       text NOT NULL UNIQUE,        -- human readable e.g. PGF-2026-000123
  customer_id        uuid REFERENCES customers(id) ON DELETE SET NULL,
  email              citext NOT NULL,
  status             text NOT NULL DEFAULT 'pending'
                     CHECK (status IN ('pending','paid','fulfilled','shipped','delivered','cancelled','refunded')),
  currency           text NOT NULL DEFAULT 'EUR',
  subtotal_cents     int NOT NULL,
  shipping_cents     int NOT NULL DEFAULT 0,
  tax_cents          int NOT NULL DEFAULT 0,
  discount_cents     int NOT NULL DEFAULT 0,
  total_cents        int NOT NULL,
  shipping_address   jsonb NOT NULL,              -- snapshot
  billing_address    jsonb NOT NULL,              -- snapshot
  shipping_method    text,
  tracking_number    text,
  notes              text,
  stripe_payment_id  text,
  stripe_session_id  text,
  paid_at            timestamptz,
  fulfilled_at       timestamptz,
  cancelled_at       timestamptz,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_orders_customer ON orders(customer_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created ON orders(created_at DESC);
CREATE TRIGGER trg_orders_updated BEFORE UPDATE ON orders
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE order_items (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id          uuid NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
  product_id        uuid REFERENCES products(id) ON DELETE SET NULL,
  variant_id        uuid REFERENCES product_variants(id) ON DELETE SET NULL,
  sku               text,
  name_snapshot     text NOT NULL,                -- store name at time of order
  variant_snapshot  jsonb,
  image_snapshot    text,
  quantity          int NOT NULL CHECK (quantity > 0),
  unit_price_cents  int NOT NULL,
  total_cents       int NOT NULL,
  created_at        timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX idx_order_items_order ON order_items(order_id);

-- ---------------------------------------------------------------------------
-- Discount codes
-- ---------------------------------------------------------------------------
CREATE TABLE discount_codes (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  code            citext NOT NULL UNIQUE,
  kind            text NOT NULL CHECK (kind IN ('percentage','fixed')),
  value           int NOT NULL,                    -- percent (0-100) or cents
  min_subtotal_cents int NOT NULL DEFAULT 0,
  max_uses        int,
  used_count      int NOT NULL DEFAULT 0,
  expires_at      timestamptz,
  is_active       boolean NOT NULL DEFAULT true,
  created_at      timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Content: pages + contact + settings
-- ---------------------------------------------------------------------------
CREATE TABLE pages (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug          text NOT NULL UNIQUE,
  title_fr      text NOT NULL,
  title_en      text NOT NULL,
  body_fr       text,
  body_en       text,
  seo_title_fr  text,
  seo_title_en  text,
  seo_description_fr text,
  seo_description_en text,
  status        text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published')),
  updated_at    timestamptz NOT NULL DEFAULT now(),
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_pages_updated BEFORE UPDATE ON pages
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TABLE contacts (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name     text NOT NULL,
  email         citext NOT NULL,
  phone         text,
  subject       text,
  message       text NOT NULL,
  locale        text NOT NULL DEFAULT 'fr',
  status        text NOT NULL DEFAULT 'new' CHECK (status IN ('new','in_progress','closed','spam')),
  created_at    timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE site_settings (
  key           text PRIMARY KEY,
  value         jsonb NOT NULL,
  updated_at    timestamptz NOT NULL DEFAULT now()
);

-- ---------------------------------------------------------------------------
-- Admin users
-- ---------------------------------------------------------------------------
CREATE TABLE admin_users (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email         citext NOT NULL UNIQUE,
  display_name  text NOT NULL,
  password_hash text,
  role          text NOT NULL DEFAULT 'editor' CHECK (role IN ('super_admin','editor')),
  is_active     boolean NOT NULL DEFAULT true,
  last_login_at timestamptz,
  created_at    timestamptz NOT NULL DEFAULT now(),
  updated_at    timestamptz NOT NULL DEFAULT now()
);
CREATE TRIGGER trg_admin_users_updated BEFORE UPDATE ON admin_users
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
