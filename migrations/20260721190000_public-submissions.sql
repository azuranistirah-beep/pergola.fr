-- Track public form submissions per IP for rate limiting.
create table if not exists public_submissions (
  id            bigserial primary key,
  kind          text        not null check (kind in ('contact', 'newsletter')),
  ip            text        not null,
  submitted_at  timestamptz not null default now()
);
create index if not exists public_submissions_kind_ip_time_idx
  on public_submissions(kind, ip, submitted_at desc);
alter table public_submissions enable row level security;
-- No policies → only accessible via service role.
