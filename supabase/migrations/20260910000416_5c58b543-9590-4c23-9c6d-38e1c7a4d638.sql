DO $$
DECLARE
  iss RECORD;
  cat RECORD;
  pos INT;
BEGIN
  FOR iss IN SELECT id, display_label FROM public.catalog_issues LOOP
    IF EXISTS (SELECT 1 FROM public.catalog_issue_blocks WHERE issue_id = iss.id) THEN
      CONTINUE;
    END IF;
    pos := 0;
    INSERT INTO public.catalog_issue_blocks (issue_id, position, kind, config)
    VALUES (iss.id, pos, 'cover', '{}'::jsonb);
    pos := pos + 1;

    FOR cat IN
      SELECT s.category, jsonb_agg(s.catalog_book_id ORDER BY s.order_index) AS ids
      FROM public.catalog_issue_selections s
      WHERE s.issue_id = iss.id
      GROUP BY s.category
      ORDER BY s.category
    LOOP
      INSERT INTO public.catalog_issue_blocks (issue_id, position, kind, config)
      VALUES (iss.id, pos, 'sectionBanner', jsonb_build_object('title', cat.category));
      pos := pos + 1;

      IF jsonb_array_length(cat.ids) = 1 THEN
        INSERT INTO public.catalog_issue_blocks (issue_id, position, kind, config)
        VALUES (iss.id, pos, 'hero', jsonb_build_object('bookId', cat.ids->>0));
      ELSE
        INSERT INTO public.catalog_issue_blocks (issue_id, position, kind, config)
        VALUES (iss.id, pos, 'grid', jsonb_build_object('bookIds', cat.ids, 'featuredBookId', cat.ids->>0));
      END IF;
      pos := pos + 1;
    END LOOP;

    INSERT INTO public.catalog_issue_blocks (issue_id, position, kind, config)
    VALUES (
      iss.id,
      pos,
      'personality',
      jsonb_build_object(
        'heading', 'Notes from the team',
        'body', 'Thanks for reading ' || iss.display_label || ' of The Indie Book Table. Every book on these pages was chosen by hand from what indie authors sent us this month.' || chr(10) || chr(10) || 'Found something you loved? Tell the author. It matters more than you think.'
      )
    );
  END LOOP;
END $$;