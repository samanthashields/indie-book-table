-- 1. fix broken collaborator book visibility policy
DROP POLICY IF EXISTS "Collaborators can view books they belong to" ON public.books;
CREATE POLICY "Collaborators can view books they belong to"
ON public.books FOR SELECT TO authenticated
USING (exists (select 1 from public.collaborators c where c.book_id = books.id and c.user_id = auth.uid() and c.status = 'active'));

-- 2. invitations
ALTER TABLE public.collaborators
  ADD COLUMN IF NOT EXISTS expires_at timestamptz NOT NULL DEFAULT (now() + interval '14 days'),
  ADD COLUMN IF NOT EXISTS accepted_at timestamptz;

CREATE POLICY "Invited users can accept their invitation"
ON public.collaborators FOR UPDATE TO authenticated
USING (
  status = 'invited'
  AND expires_at > now()
  AND email = (select u.email from auth.users u where u.id = auth.uid())::text
)
WITH CHECK (user_id = auth.uid());

-- 3. notifications
CREATE TABLE public.notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  book_id uuid REFERENCES public.books(id) ON DELETE CASCADE,
  kind text NOT NULL,
  title text NOT NULL,
  body text,
  link text,
  read_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read their own notifications"
ON public.notifications FOR SELECT TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Users update their own notifications"
ON public.notifications FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Users delete their own notifications"
ON public.notifications FOR DELETE TO authenticated USING (user_id = auth.uid());
CREATE POLICY "Book members can notify"
ON public.notifications FOR INSERT TO authenticated
WITH CHECK (book_id IS NULL OR public.is_book_member(book_id));
CREATE INDEX notifications_user_created_idx ON public.notifications (user_id, created_at DESC);

-- 4. admin management of people
CREATE POLICY "Admins can view all profiles"
ON public.profiles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can update any profile"
ON public.profiles FOR UPDATE TO authenticated
USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can view all roles"
ON public.user_roles FOR SELECT TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can grant roles"
ON public.user_roles FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can revoke roles"
ON public.user_roles FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- 5. storage rules for the private book-files bucket (paths are "<book_id>/...")
CREATE POLICY "Book members can read book files"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'book-files'
  AND public.is_book_member(nullif(split_part(name, '/', 1), '')::uuid)
);
CREATE POLICY "Book members can upload book files"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'book-files'
  AND public.is_book_member(nullif(split_part(name, '/', 1), '')::uuid)
);
CREATE POLICY "Book members can update book files"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'book-files'
  AND public.is_book_member(nullif(split_part(name, '/', 1), '')::uuid)
);
CREATE POLICY "Book authors can delete book files"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'book-files'
  AND public.is_book_author(nullif(split_part(name, '/', 1), '')::uuid)
);