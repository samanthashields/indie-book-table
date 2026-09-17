CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO anon, authenticated, service_role;

CREATE OR REPLACE FUNCTION private.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT (
    _user_id = auth.uid()
    OR auth.role() = 'service_role'
  ) AND EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION private.is_book_author(_book_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.books
    WHERE id = _book_id AND author_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION private.is_book_member(_book_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT private.is_book_author(_book_id)
    OR EXISTS (
      SELECT 1 FROM public.collaborators
      WHERE book_id = _book_id
        AND user_id = auth.uid()
        AND status = 'active'
    )
$$;

CREATE OR REPLACE FUNCTION private.is_book_member_user(_book_id uuid, _user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.books
    WHERE id = _book_id AND author_id = _user_id
  ) OR EXISTS (
    SELECT 1 FROM public.collaborators
    WHERE book_id = _book_id
      AND user_id = _user_id
      AND status = 'active'
  )
$$;

CREATE OR REPLACE FUNCTION private.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT u.email::text FROM auth.users u WHERE u.id = auth.uid()
$$;

CREATE OR REPLACE FUNCTION private.is_catalog_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT private.has_role(auth.uid(), 'admin'::public.app_role)
$$;

CREATE OR REPLACE FUNCTION private.is_my_catalog_author(_author_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.catalog_authors
    WHERE id = _author_id AND user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION private.owns_catalog_book(_book_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.catalog_books b
    JOIN public.catalog_authors a ON a.id = b.catalog_author_id
    WHERE b.id = _book_id AND a.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION private.catalog_author_is_published(_author_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.catalog_books b
    JOIN public.catalog_issue_selections s ON s.catalog_book_id = b.id
    JOIN public.catalog_issues i ON i.id = s.issue_id
    WHERE b.catalog_author_id = _author_id AND i.status = 'published'
  )
$$;

CREATE OR REPLACE FUNCTION private.catalog_book_is_published(_book_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.catalog_issue_selections s
    JOIN public.catalog_issues i ON i.id = s.issue_id
    WHERE s.catalog_book_id = _book_id AND i.status = 'published'
  )
$$;

CREATE OR REPLACE FUNCTION private.catalog_issue_contains_my_book(_issue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.catalog_issue_selections s
    JOIN public.catalog_books b ON b.id = s.catalog_book_id
    JOIN public.catalog_authors a ON a.id = b.catalog_author_id
    WHERE s.issue_id = _issue_id AND a.user_id = auth.uid()
  )
$$;

CREATE OR REPLACE FUNCTION private.catalog_issue_is_published(_issue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.catalog_issues
    WHERE id = _issue_id AND status = 'published'
  )
$$;

CREATE OR REPLACE FUNCTION private.catalog_author_email(_author_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public, pg_temp
AS $$
  SELECT a.email
  FROM public.catalog_authors a
  WHERE a.id = _author_id
    AND (
      private.is_my_catalog_author(_author_id)
      OR private.is_catalog_admin()
    )
$$;

REVOKE ALL ON ALL FUNCTIONS IN SCHEMA private FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.catalog_author_is_published(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.catalog_book_is_published(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.catalog_issue_is_published(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.catalog_issue_contains_my_book(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.current_user_email() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_book_author(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_book_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_book_member_user(uuid, uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_catalog_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.is_my_catalog_author(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.owns_catalog_book(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION private.catalog_author_email(uuid) TO authenticated, service_role;

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.has_role(_user_id, _role) $$;

CREATE OR REPLACE FUNCTION public.is_book_author(_book_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.is_book_author(_book_id) $$;

CREATE OR REPLACE FUNCTION public.is_book_member(_book_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.is_book_member(_book_id) $$;

CREATE OR REPLACE FUNCTION public.current_user_email()
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.current_user_email() $$;

CREATE OR REPLACE FUNCTION public.is_catalog_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.is_catalog_admin() $$;

CREATE OR REPLACE FUNCTION public.is_my_catalog_author(_author_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.is_my_catalog_author(_author_id) $$;

CREATE OR REPLACE FUNCTION public.owns_catalog_book(_book_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.owns_catalog_book(_book_id) $$;

CREATE OR REPLACE FUNCTION public.catalog_author_is_published(_author_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.catalog_author_is_published(_author_id) $$;

CREATE OR REPLACE FUNCTION public.catalog_book_is_published(_book_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.catalog_book_is_published(_book_id) $$;

CREATE OR REPLACE FUNCTION public.catalog_issue_contains_my_book(_issue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.catalog_issue_contains_my_book(_issue_id) $$;

CREATE OR REPLACE FUNCTION public.catalog_issue_is_published(_issue_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.catalog_issue_is_published(_issue_id) $$;

CREATE OR REPLACE FUNCTION public.catalog_author_email(_author_id uuid)
RETURNS text
LANGUAGE sql
STABLE
SECURITY INVOKER
SET search_path = public, pg_temp
AS $$ SELECT private.catalog_author_email(_author_id) $$;

REVOKE ALL ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_book_author(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_book_member(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.current_user_email() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_catalog_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_my_catalog_author(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.owns_catalog_book(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.catalog_author_is_published(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.catalog_book_is_published(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.catalog_issue_contains_my_book(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.catalog_issue_is_published(uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.catalog_author_email(uuid) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.catalog_author_is_published(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.catalog_book_is_published(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.catalog_issue_is_published(uuid) TO anon, authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.catalog_issue_contains_my_book(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.current_user_email() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_book_author(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_book_member(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_catalog_admin() TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.is_my_catalog_author(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.owns_catalog_book(uuid) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.catalog_author_email(uuid) TO authenticated, service_role;

REVOKE SELECT (email) ON public.catalog_authors FROM anon, authenticated;

DROP POLICY IF EXISTS "Book members can notify" ON public.notifications;
CREATE POLICY "Book members can notify legitimate recipients"
ON public.notifications
FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR private.is_catalog_admin()
  OR (
    book_id IS NOT NULL
    AND private.is_book_member(book_id)
    AND private.is_book_member_user(book_id, user_id)
  )
);