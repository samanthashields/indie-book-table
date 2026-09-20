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

-- Security fix: stop exposing catalog_authors.email through table reads
REVOKE SELECT ON public.catalog_authors FROM anon, authenticated;
GRANT SELECT (id, user_id, name, instagram_handle, website, bio, created_at, updated_at)
  ON public.catalog_authors TO anon, authenticated;