-- Adds invoice_number to orders (assigned once, on first invoice generation).
-- Company legal and banking info lives in the existing site_settings key='site' JSON,
-- so no schema change is needed there.

alter table orders add column if not exists invoice_number text;
alter table orders add column if not exists invoice_issued_at timestamptz;

create unique index if not exists orders_invoice_number_unique
  on orders(invoice_number) where invoice_number is not null;
