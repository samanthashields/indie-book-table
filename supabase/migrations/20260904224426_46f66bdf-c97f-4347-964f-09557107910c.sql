revoke execute on function public.has_role(uuid, public.app_role) from public, anon, authenticated;
revoke execute on function public.is_book_author(uuid) from public, anon, authenticated;
revoke execute on function public.is_book_member(uuid) from public, anon, authenticated;