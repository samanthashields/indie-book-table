DROP POLICY "Site content is public" ON public.catalog_site_content;

CREATE POLICY "Public site content readable by anyone"
  ON public.catalog_site_content FOR SELECT
  TO anon, authenticated
  USING (key NOT LIKE 'welcome\_email\_%');

CREATE POLICY "Admins read all site content"
  ON public.catalog_site_content FOR SELECT
  TO authenticated
  USING (private.is_catalog_admin());