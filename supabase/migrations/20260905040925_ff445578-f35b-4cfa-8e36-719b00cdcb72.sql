CREATE POLICY "Catalog covers are readable" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'catalog-covers');

CREATE POLICY "Authors upload their own catalog covers" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'catalog-covers' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_catalog_admin()));

CREATE POLICY "Authors replace their own catalog covers" ON storage.objects FOR UPDATE TO authenticated USING (bucket_id = 'catalog-covers' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_catalog_admin())) WITH CHECK (bucket_id = 'catalog-covers' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_catalog_admin()));

CREATE POLICY "Authors delete their own catalog covers" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'catalog-covers' AND ((storage.foldername(name))[1] = auth.uid()::text OR public.is_catalog_admin()));