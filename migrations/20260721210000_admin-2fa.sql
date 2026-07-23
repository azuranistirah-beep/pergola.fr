-- Two-factor authentication (TOTP) for admin users.
alter table admin_users add column if not exists totp_secret  text;
alter table admin_users add column if not exists totp_enabled boolean not null default false;
