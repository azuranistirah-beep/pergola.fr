-- Payment methods (company bank accounts, extensible to other channels later).
-- Multiple accounts supported; exactly one active can be marked as default so
-- the invoice and public "how to order" pages know which one to feature first.

create type payment_method_kind as enum ('BANK');

create table if not exists payment_methods (
  id           text primary key default gen_random_uuid()::text,
  kind         payment_method_kind not null default 'BANK',
  label        text        not null,
  holder       text,
  bank_name    text,
  iban         text,
  bic          text,
  notes        text,
  is_default   boolean     not null default false,
  is_active    boolean     not null default true,
  sort_order   integer     not null default 0,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now()
);
create index if not exists payment_methods_default_idx
  on payment_methods(is_default) where is_default;
create index if not exists payment_methods_active_idx
  on payment_methods(is_active, sort_order);
alter table payment_methods enable row level security;
-- No policies → service role only (INSFORGE_API_KEY).

-- One-shot seed from the deprecated `site_settings.value` (bankName/iban/bic).
-- Only inserts if there is bank data in settings AND no rows already exist.
insert into payment_methods (label, bank_name, iban, bic, is_default, is_active, sort_order)
select
  coalesce(nullif(value->>'bankName', ''), 'Compte principal'),
  nullif(value->>'bankName', ''),
  nullif(value->>'bankIban', ''),
  nullif(value->>'bankBic', ''),
  true,
  true,
  0
from site_settings
where key = 'site'
  and (nullif(value->>'bankIban', '') is not null or nullif(value->>'bankName', '') is not null)
  and not exists (select 1 from payment_methods);
