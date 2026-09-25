-- Post Launch Recommended Tasks (optional): grouped, non-blocking checklist at the end of a Book Cycle.
-- Mirrors book_setup_tasks (completion state only) plus group_label for nesting under a category.
CREATE TABLE public.book_post_launch_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  key text NOT NULL,
  label text NOT NULL,
  group_label text NOT NULL,
  status text NOT NULL DEFAULT 'pending',
  position int NOT NULL DEFAULT 0,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_post_launch_tasks TO authenticated;
GRANT ALL ON public.book_post_launch_tasks TO service_role;
ALTER TABLE public.book_post_launch_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors manage their post launch tasks" ON public.book_post_launch_tasks
  FOR ALL TO authenticated
  USING (is_book_author(book_id) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (is_book_author(book_id) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Book members can view post launch tasks" ON public.book_post_launch_tasks
  FOR SELECT TO authenticated
  USING (is_book_member(book_id));

CREATE OR REPLACE FUNCTION public.delete_book_cycle(_book_id uuid)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _phases int := 0;
  _milestones int := 0;
  _actor uuid := auth.uid();
BEGIN
  IF _actor IS NULL THEN
    RAISE EXCEPTION 'Not authorised to delete this book cycle';
  END IF;
  IF NOT (public.is_book_author(_book_id) OR public.has_role(_actor, 'admin'::app_role)) THEN
    RAISE EXCEPTION 'Not authorised to delete this book cycle';
  END IF;

  SELECT count(*) INTO _milestones FROM public.milestones WHERE book_id = _book_id;

  WITH deleted AS (
    DELETE FROM public.phases WHERE book_id = _book_id RETURNING 1
  )
  SELECT count(*) INTO _phases FROM deleted;

  DELETE FROM public.milestones WHERE book_id = _book_id;
  DELETE FROM public.book_setup_tasks WHERE book_id = _book_id;
  DELETE FROM public.book_post_launch_tasks WHERE book_id = _book_id;
  DELETE FROM public.reflections WHERE book_id = _book_id;

  UPDATE public.books
     SET has_cycle = false,
         status = 'idea',
         template_id = NULL,
         start_date = NULL
   WHERE id = _book_id;

  INSERT INTO public.activity (book_id, actor_user_id, actor_name, text)
  VALUES (
    _book_id,
    _actor,
    (SELECT display_name FROM public.profiles WHERE user_id = _actor),
    'Deleted the book cycle.'
  );

  RETURN jsonb_build_object('phases_deleted', _phases, 'milestones_deleted', _milestones);
END;
$$;

REVOKE ALL ON FUNCTION public.delete_book_cycle(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.delete_book_cycle(uuid) TO authenticated;
