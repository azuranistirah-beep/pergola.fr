-- Pergolafr.com catalog schema
-- Minimal subset used by Home / PLP / PDP.
-- Auth-related tables (orders, cart, addresses, etc.) come later once we
-- move from Auth.js to InsForge Auth.

create table categories (
  id           text primary key,
  slug         varchar(160) unique not null,
  parent_id    text references categories(id) on delete set null,
  sort_order   integer not null default 0,
  image_url    text,
  is_featured  boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index categories_parent_idx on categories(parent_id);
create index categories_featured_idx on categories(is_featured);

create table category_translations (
  id           text primary key,
  category_id  text not null references categories(id) on delete cascade,
  locale       varchar(8) not null,
  name         text not null,
  description  text,
  unique (category_id, locale)
);

create type product_status as enum ('DRAFT', 'PUBLISHED', 'ARCHIVED');

create table products (
  id                text primary key,
  sku               varchar(64) unique not null,
  slug              varchar(200) unique not null,
  category_id       text not null references categories(id),
  status            product_status not null default 'DRAFT',
  base_price_cents  integer not null,
  currency          varchar(3) not null default 'EUR',
  stock             integer not null default 0,
  weight_grams      integer,
  is_configurable   boolean not null default false,
  is_featured       boolean not null default false,
  family            varchar(40),
  material          varchar(16),
  colorway          varchar(20),
  finish            varchar(64),
  width_ft          integer,
  length_ft         integer,
  width_cm          integer,
  length_cm         integer,
  published_at      timestamptz,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index products_category_status_idx on products(category_id, status);
create index products_featured_status_idx on products(is_featured, status);
create index products_published_idx on products(published_at);

create table product_translations (
  id            text primary key,
  product_id    text not null references products(id) on delete cascade,
  locale        varchar(8) not null,
  name          text not null,
  short_desc    text,
  description   text,
  features_json jsonb,
  unique (product_id, locale)
);

create type media_type as enum ('IMAGE', 'VIDEO');

create table product_media (
  id           text primary key,
  product_id   text not null references products(id) on delete cascade,
  url          text not null,
  alt_text     text,
  type         media_type not null default 'IMAGE',
  sort_order   integer not null default 0,
  is_lifestyle boolean not null default false,
  is_cover     boolean not null default false
);
create index product_media_product_idx on product_media(product_id);

-- Public reads for anonymous shoppers; admin writes come later via service key.
alter table categories             enable row level security;
alter table category_translations  enable row level security;
alter table products               enable row level security;
alter table product_translations   enable row level security;
alter table product_media          enable row level security;

create policy "categories_public_read"        on categories             for select using (true);
create policy "category_translations_public"  on category_translations  for select using (true);
create policy "products_public_read"          on products               for select using (status = 'PUBLISHED');
create policy "product_translations_public"   on product_translations   for select using (true);
create policy "product_media_public"          on product_media          for select using (true);
