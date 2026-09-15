-- Hide the email column from public/authenticated direct reads; name, bio and links stay public.
REVOKE SELECT (email) ON public.catalog_authors FROM anon, authenticated;

-- Guarded lookup: authors can read their own email, admins can read any.
CREATE OR REPLACE FUNCTION public.catalog_author_email(_author_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT a.email FROM public.catalog_authors a
  WHERE a.id = _author_id
    AND (public.is_my_catalog_author(_author_id) OR public.is_catalog_admin())
$$;
REVOKE EXECUTE ON FUNCTION public.catalog_author_email(uuid) FROM anon;