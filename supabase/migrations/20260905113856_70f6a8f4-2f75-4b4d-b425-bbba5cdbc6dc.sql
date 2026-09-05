GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, anon;
GRANT EXECUTE ON FUNCTION public.is_book_author(uuid) TO authenticated;
GRANT EXECUTE ON FUNCTION public.is_book_member(uuid) TO authenticated;

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT u.email::text FROM auth.users u WHERE u.id = auth.uid()
$$;

GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated;

DROP POLICY IF EXISTS "Collaborators can view their own membership" ON public.collaborators;
CREATE POLICY "Collaborators can view their own membership"
ON public.collaborators
FOR SELECT
TO authenticated
USING (user_id = auth.uid() OR email = public.current_user_email());

DROP POLICY IF EXISTS "Invited users can accept their invitation" ON public.collaborators;
CREATE POLICY "Invited users can accept their invitation"
ON public.collaborators
FOR UPDATE
TO authenticated
USING (status = 'invited' AND expires_at > now() AND email = public.current_user_email())
WITH CHECK (email = public.current_user_email());