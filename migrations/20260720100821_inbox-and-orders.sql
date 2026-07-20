-- Inbox tables (contact form + newsletter) + orders + content KV.

create type contact_status as enum ('NEW', 'READ', 'REPLIED', 'ARCHIVED');

create table contact_messages (
  id         text primary key default gen_random_uuid()::text,
  name       text        not null,
  email      text        not null,
  phone      text,
  postal     text,
  message    text        not null,
  status     contact_status not null default 'NEW',
  locale     varchar(8)  not null default 'fr',
  created_at timestamptz not null default now()
);
create index contact_messages_status_idx on contact_messages(status);
create index contact_messages_created_idx on contact_messages(created_at desc);
alter table contact_messages enable row level security;
create policy "contact_public_insert" on contact_messages for insert with check (true);

create table newsletter_subscribers (
  email          varchar(160) primary key,
  locale         varchar(8) not null default 'fr',
  subscribed_at  timestamptz not null default now(),
  unsubscribed_at timestamptz
);
alter table newsletter_subscribers enable row level security;
create policy "newsletter_public_insert" on newsletter_subscribers for insert with check (true);

create type order_status as enum ('PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED');

create table orders (
  id            text primary key default gen_random_uuid()::text,
  order_number  varchar(24) unique not null,
  customer_name text,
  customer_email text,
  status        order_status not null default 'PENDING',
  total_cents   integer     not null,
  items_count   integer     not null default 1,
  currency      varchar(3)  not null default 'EUR',
  created_at    timestamptz not null default now()
);
create index orders_status_idx on orders(status);
create index orders_created_idx on orders(created_at desc);
alter table orders enable row level security;

insert into orders (order_number, customer_name, customer_email, status, total_cents, items_count) values
  ('PGL-2026-00184', 'Camille Riviere',    'c.riviere@example.fr',   'PROCESSING', 849000,  1),
  ('PGL-2026-00183', 'Antoine Lefebvre',   'a.lefebvre@example.fr',  'SHIPPED',    214000,  2),
  ('PGL-2026-00182', 'Helene Rousseau',    'h.rousseau@example.fr',  'DELIVERED',  143000,  1),
  ('PGL-2026-00181', 'Marc Delaunay',      'm.delaunay@resto.fr',    'PAID',       528000,  1),
  ('PGL-2026-00180', 'Sarah Colin',        's.colin@example.fr',     'PENDING',    114000,  1);

insert into site_settings (key, value) values
  ('content', '{
    "heroTitleFr": "L''art de vivre dehors, redessine.",
    "heroTitleEn": "Outdoor living, redrawn.",
    "heroSubtitleFr": "Pergolas bioclimatiques, gazebos et structures d''exterieur haut de gamme.",
    "heroSubtitleEn": "Bioclimatic pergolas, gazebos and premium outdoor structures.",
    "heroEyebrowFr": "Collection 2026",
    "heroEyebrowEn": "2026 Collection"
  }'::jsonb)
on conflict (key) do nothing;
