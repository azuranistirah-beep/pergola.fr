-- Track admin login attempts for rate-limiting brute force.
create table if not exists admin_login_attempts (
  id            bigserial primary key,
  ip            text        not null,
  success       boolean     not null,
  attempted_at  timestamptz not null default now()
);
create index if not exists admin_login_attempts_ip_time_idx
  on admin_login_attempts(ip, attempted_at desc);
alter table admin_login_attempts enable row level security;
-- No policies → only accessible via service role (INSFORGE_API_KEY).
