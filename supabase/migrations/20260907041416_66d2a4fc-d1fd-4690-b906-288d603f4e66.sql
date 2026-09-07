CREATE POLICY "Authors manage their own table picture"
  ON storage.objects FOR ALL TO authenticated
  USING (bucket_id = 'table-shares' AND (storage.foldername(name))[1] = auth.uid()::text)
  WITH CHECK (bucket_id = 'table-shares' AND (storage.foldername(name))[1] = auth.uid()::text);