-- Lets an admin hide the headline and tagline on an issue's public page, so a wide
-- banner image can stand on its own.
ALTER TABLE public.catalog_issue_themes ADD COLUMN hide_cover_text boolean NOT NULL DEFAULT false;
