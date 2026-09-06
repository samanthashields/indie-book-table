CREATE POLICY "Authors manage their own feature request files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'feature-request-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
)
WITH CHECK (
  bucket_id = 'feature-request-files'
  AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Admins manage feature request files"
ON storage.objects
FOR ALL
TO authenticated
USING (
  bucket_id = 'feature-request-files'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
)
WITH CHECK (
  bucket_id = 'feature-request-files'
  AND public.has_role(auth.uid(), 'admin'::public.app_role)
);

CREATE POLICY "Signed-in readers see files on approved ideas"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'feature-request-files'
  AND EXISTS (
    SELECT 1 FROM public.feature_requests r
    WHERE r.approved
      AND r.attachments @> to_jsonb(ARRAY[jsonb_build_object('path', storage.objects.name)])
  )
);