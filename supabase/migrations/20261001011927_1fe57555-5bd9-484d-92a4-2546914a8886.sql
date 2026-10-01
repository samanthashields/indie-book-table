ALTER TABLE public.catalog_issue_themes
  ADD COLUMN IF NOT EXISTS hide_cover_text boolean NOT NULL DEFAULT false;