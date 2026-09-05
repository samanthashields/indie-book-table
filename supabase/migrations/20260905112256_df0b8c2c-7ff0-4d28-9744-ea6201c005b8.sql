INSERT INTO public.catalog_site_content (key, value) VALUES
  ('mission.headline', 'Our mission'),
  ('mission.body', 'The Table is a shared table, not a storefront. Every month we set out a new issue of independently published books and ask how each one was made — who edited it, who drew the cover, where the help came from — so readers can choose with open eyes. Awards are welcome here, but they are not the price of a seat.'),
  ('mission.taglines', 'We ask how a book was made. We never ask permission.
A shared table, not a storefront.
Every indie author''s journey belongs somewhere.')
ON CONFLICT (key) DO NOTHING;