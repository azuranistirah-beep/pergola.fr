-- Multi-user admin authentication with bcrypt-hashed passwords.
create table if not exists admin_users (
  id             text primary key default gen_random_uuid()::text,
  email          text unique not null,
  password_hash  text        not null,
  name           text        not null,
  is_active      boolean     not null default true,
  created_at     timestamptz not null default now(),
  last_login_at  timestamptz
);
create index if not exists admin_users_email_idx on admin_users(email);
alter table admin_users enable row level security;
-- No policies → only accessible via service role (INSFORGE_API_KEY).

-- Link login attempts + audit trail to a specific user when known.
alter table admin_login_attempts add column if not exists user_id text;
alter table admin_login_attempts add column if not exists email  text;
