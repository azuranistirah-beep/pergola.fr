-- Sample data — categories, products, settings

INSERT INTO categories (slug, name_fr, name_en, description_fr, description_en, sort_order) VALUES
  ('pergolas-bioclimatiques', 'Pergolas bioclimatiques', 'Bioclimatic Pergolas',
   'Structures à lames orientables pour un confort toute saison.',
   'Adjustable-blade structures for year-round comfort.', 10),
  ('pergolas-toile', 'Pergolas à toile', 'Fabric Pergolas',
   'Toits en toile résistante pour un ombrage naturel.',
   'Durable fabric roofs for natural shading.', 20),
  ('pergolas-adossees', 'Pergolas adossées', 'Wall-Mounted Pergolas',
   'Solutions élégantes à adosser à votre façade.',
   'Elegant solutions to attach to your façade.', 30),
  ('accessoires', 'Accessoires', 'Accessories',
   'Éclairage, chauffage, capteurs et plus.',
   'Lighting, heating, sensors and more.', 40)
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, sku, category_id, name_fr, name_en, short_desc_fr, short_desc_en,
                     price_cents, compare_at_cents, stock_qty, status, is_featured, sort_order, published_at,
                     images, specs)
SELECT
  'aurora-bioclimatique-3x4', 'PGF-BIO-3X4-BLK',
  c.id, 'Aurora Bioclimatique 3×4', 'Aurora Bioclimatic 3×4',
  'Pergola bioclimatique en aluminium noir, 3m × 4m, lames orientables motorisées.',
  'Black aluminum bioclimatic pergola, 3m × 4m, motorized adjustable blades.',
  489900, 549900, 12, 'published', true, 10, now(),
  '[{"url":"/uploads/placeholder-pergola-1.jpg","alt":"Aurora Bioclimatique"}]'::jsonb,
  '{"material":"aluminium","color":"noir","dimensions":"3×4 m","motorisation":true,"garantie_ans":10}'::jsonb
FROM categories c WHERE c.slug = 'pergolas-bioclimatiques'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, sku, category_id, name_fr, name_en, short_desc_fr, short_desc_en,
                     price_cents, stock_qty, status, is_featured, sort_order, published_at,
                     images, specs)
SELECT
  'sirocco-toile-4x5', 'PGF-TOL-4X5-WHT',
  c.id, 'Sirocco Toile 4×5', 'Sirocco Fabric 4×5',
  'Pergola à toile enroulable, structure aluminium blanc, toile déperlante.',
  'Retractable fabric pergola, white aluminum structure, water-repellent fabric.',
  289900, 8, 'published', true, 20, now(),
  '[{"url":"/uploads/placeholder-pergola-2.jpg","alt":"Sirocco Toile"}]'::jsonb,
  '{"material":"aluminium","color":"blanc","dimensions":"4×5 m","garantie_ans":5}'::jsonb
FROM categories c WHERE c.slug = 'pergolas-toile'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, sku, category_id, name_fr, name_en, short_desc_fr, short_desc_en,
                     price_cents, stock_qty, status, sort_order, published_at,
                     images, specs)
SELECT
  'mistral-adossee-3x3', 'PGF-ADO-3X3-GRY',
  c.id, 'Mistral Adossée 3×3', 'Mistral Wall-Mounted 3×3',
  'Pergola adossée compacte pour terrasse ou balcon.',
  'Compact wall-mounted pergola for terrace or balcony.',
  199900, 20, 'published', 30, now(),
  '[{"url":"/uploads/placeholder-pergola-3.jpg","alt":"Mistral Adossée"}]'::jsonb,
  '{"material":"aluminium","color":"gris anthracite","dimensions":"3×3 m","garantie_ans":7}'::jsonb
FROM categories c WHERE c.slug = 'pergolas-adossees'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO products (slug, sku, category_id, name_fr, name_en, short_desc_fr, short_desc_en,
                     price_cents, stock_qty, status, sort_order, published_at,
                     images, specs)
SELECT
  'kit-eclairage-led', 'PGF-ACC-LED-KIT',
  c.id, 'Kit éclairage LED', 'LED Lighting Kit',
  'Bandeau LED dimmable, télécommande incluse.',
  'Dimmable LED strip, remote included.',
  14900, 50, 'published', 10, now(),
  '[{"url":"/uploads/placeholder-accessory-1.jpg","alt":"LED Kit"}]'::jsonb,
  '{"puissance_w":48,"longueur_m":4,"telecommande":true}'::jsonb
FROM categories c WHERE c.slug = 'accessoires'
ON CONFLICT (slug) DO NOTHING;

INSERT INTO pages (slug, title_fr, title_en, body_fr, body_en, status) VALUES
  ('a-propos', 'À propos', 'About us',
   'Fabricant français de pergolas depuis 2015.',
   'French pergola manufacturer since 2015.', 'published'),
  ('livraison', 'Livraison & installation', 'Delivery & installation',
   'Livraison en France métropolitaine sous 4 à 8 semaines.',
   'Delivery in metropolitan France within 4 to 8 weeks.', 'published'),
  ('garantie', 'Garantie', 'Warranty',
   'Garantie constructeur de 5 à 10 ans selon le modèle.',
   'Manufacturer warranty of 5 to 10 years depending on model.', 'published')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO site_settings (key, value) VALUES
  ('brand', '{"name":"Pergola FR","domain":"pergolafr.com","tagline_fr":"Pergolas premium, fabrication française","tagline_en":"Premium pergolas, French manufacturing"}'::jsonb),
  ('contact', '{"email":"contact@pergolafr.com","phone":"+33 1 23 45 67 89","address":"Paris, France"}'::jsonb),
  ('shipping', '{"free_from_cents":250000,"standard_cents":9900,"express_cents":19900}'::jsonb),
  ('tax', '{"vat_rate":0.20,"included_in_price":true}'::jsonb)
ON CONFLICT (key) DO NOTHING;
