-- Extend orders with line items, shipping address, and phone.
-- Enables order detail page, invoice PDF generation, and manual order creation.

alter table orders add column if not exists customer_phone   text;
alter table orders add column if not exists shipping_address text;
alter table orders add column if not exists shipping_postal  text;
alter table orders add column if not exists shipping_city    text;
alter table orders add column if not exists shipping_country text default 'FR';
alter table orders add column if not exists notes            text;
alter table orders add column if not exists paid_at          timestamptz;
alter table orders add column if not exists shipped_at       timestamptz;
alter table orders add column if not exists delivered_at     timestamptz;

create table if not exists order_items (
  id                text primary key default gen_random_uuid()::text,
  order_id          text        not null references orders(id) on delete cascade,
  product_id        text                references products(id) on delete set null,
  product_name      text        not null,
  product_slug      text,
  product_sku       text,
  unit_price_cents  integer     not null,
  quantity          integer     not null default 1,
  line_total_cents  integer     not null,
  created_at        timestamptz not null default now()
);
create index if not exists order_items_order_idx on order_items(order_id);
alter table order_items enable row level security;

-- Seed line items for the existing sample orders (idempotent — only if none exist yet).
insert into order_items (order_id, product_name, product_sku, unit_price_cents, quantity, line_total_cents)
select o.id, 'Pergola Beaumont 14x10', 'BMT-14X10', o.total_cents, 1, o.total_cents
from orders o
where not exists (select 1 from order_items oi where oi.order_id = o.id);
