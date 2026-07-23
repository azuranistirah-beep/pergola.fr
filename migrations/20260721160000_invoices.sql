-- Invoices as a first-class resource with full CRUD.
-- Independent of orders — an invoice can be linked to an order or standalone.

create type invoice_status as enum ('DRAFT', 'ISSUED', 'PAID', 'CANCELLED');

create table if not exists invoices (
  id                text primary key default gen_random_uuid()::text,
  invoice_number    text unique not null,
  order_id          text references orders(id) on delete set null,
  status            invoice_status not null default 'DRAFT',
  customer_name     text not null,
  customer_email    text,
  customer_phone    text,
  customer_address  text,
  customer_postal   text,
  customer_city     text,
  customer_country  text default 'FR',
  issued_at         timestamptz not null default now(),
  due_at            timestamptz,
  paid_at           timestamptz,
  currency          varchar(3) not null default 'EUR',
  vat_rate_percent  numeric(5,2) not null default 20,
  subtotal_ht_cents integer not null default 0,
  vat_cents         integer not null default 0,
  total_ttc_cents   integer not null default 0,
  notes             text,
  terms             text,
  footer            text,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);
create index if not exists invoices_status_idx on invoices(status);
create index if not exists invoices_issued_idx on invoices(issued_at desc);
create index if not exists invoices_order_idx  on invoices(order_id);
alter table invoices enable row level security;

create table if not exists invoice_items (
  id                text primary key default gen_random_uuid()::text,
  invoice_id        text not null references invoices(id) on delete cascade,
  description       text not null,
  sku               text,
  unit_price_cents  integer not null default 0,
  quantity          integer not null default 1,
  line_total_cents  integer not null default 0,
  sort_order        integer not null default 0,
  created_at        timestamptz not null default now()
);
create index if not exists invoice_items_invoice_idx on invoice_items(invoice_id);
alter table invoice_items enable row level security;
