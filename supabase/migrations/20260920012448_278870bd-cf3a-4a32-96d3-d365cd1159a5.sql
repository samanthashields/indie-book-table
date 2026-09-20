DROP POLICY "Admins update site content" ON public.catalog_site_content;
DROP POLICY "Admins write site content" ON public.catalog_site_content;

CREATE POLICY "Admins update site content"
  ON public.catalog_site_content FOR UPDATE
  TO authenticated
  USING (private.is_catalog_admin())
  WITH CHECK (private.is_catalog_admin());

CREATE POLICY "Admins write site content"
  ON public.catalog_site_content FOR INSERT
  TO authenticated
  WITH CHECK (private.is_catalog_admin());