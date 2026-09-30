-- Adds a per-issue PDF as an alternative to the block-built flyer sections: when set, the
-- public issue page renders the PDF instead of the blocks entirely.
ALTER TABLE public.catalog_issue_themes ADD COLUMN pdf_url text;

-- NOTE: this only adds the RLS policies. The storage bucket itself ("catalog-issue-pdfs")
-- must be created once, out of band (dashboard/Lovable) — matching how catalog-covers and
-- onboarding-media were provisioned; no migration in this repo creates a bucket directly.
CREATE POLICY "Admins read catalog issue PDFs"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'catalog-issue-pdfs' AND public.is_catalog_admin());

CREATE POLICY "Admins upload catalog issue PDFs"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'catalog-issue-pdfs' AND public.is_catalog_admin());

CREATE POLICY "Admins replace catalog issue PDFs"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'catalog-issue-pdfs' AND public.is_catalog_admin())
WITH CHECK (bucket_id = 'catalog-issue-pdfs' AND public.is_catalog_admin());

CREATE POLICY "Admins delete catalog issue PDFs"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'catalog-issue-pdfs' AND public.is_catalog_admin());