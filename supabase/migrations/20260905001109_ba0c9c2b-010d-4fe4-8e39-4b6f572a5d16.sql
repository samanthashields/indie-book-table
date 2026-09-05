REVOKE EXECUTE ON FUNCTION public.is_catalog_admin() FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.catalog_issue_is_published(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.catalog_book_is_published(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.catalog_author_is_published(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.is_my_catalog_author(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.owns_catalog_book(uuid) FROM anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.catalog_issue_contains_my_book(uuid) FROM anon, authenticated;