-- Site-wide settings (theme, contact info, hero copy, feature flags).
-- Single JSON blob keyed by kv-style `key`, so we can add fields without new
-- migrations. Public read (frontend needs theme), admin-only write.

create table site_settings (
  key        varchar(96) primary key,
  value      jsonb       not null,
  updated_at timestamptz not null default now()
);

alter table site_settings enable row level security;

create policy "site_settings_public_read"
  on site_settings for select
  using (true);

insert into site_settings (key, value) values
  ('theme', '{
    "primary": "#111111",
    "accent": "#c8a46b",
    "background": "#fafafa",
    "foreground": "#111111",
    "secondary": "#555555",
    "radius": 16
  }'::jsonb),
  ('site', '{
    "phone": "+905016479902",
    "email": "bonjour@pergolafr.com",
    "showroomAddress": "12 rue de Rivoli, 75004 Paris",
    "showroomHours": "Mardi–Samedi, 10h–19h",
    "instagram": "@pergolafr",
    "whatsappNumber": "905016479902"
  }'::jsonb);
