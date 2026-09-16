-- Admins manage the images used in emails; reads happen server-side via the service role.
CREATE POLICY "Admins upload email assets"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins update email assets"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'))
WITH CHECK (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins delete email assets"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins read email assets"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'email-assets' AND public.has_role(auth.uid(), 'admin'));