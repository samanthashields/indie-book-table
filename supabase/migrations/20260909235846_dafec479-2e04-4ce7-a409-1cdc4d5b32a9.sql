CREATE TABLE public.catalog_issue_blocks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  issue_id UUID NOT NULL REFERENCES public.catalog_issues(id) ON DELETE CASCADE,
  position INTEGER NOT NULL DEFAULT 0,
  kind TEXT NOT NULL CHECK (kind IN ('cover','sectionBanner','hero','grid','fanOut','authorSpotlight','personality')),
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

CREATE INDEX catalog_issue_blocks_issue_position_idx ON public.catalog_issue_blocks (issue_id, position);

GRANT SELECT ON public.catalog_issue_blocks TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.catalog_issue_blocks TO authenticated;
GRANT ALL ON public.catalog_issue_blocks TO service_role;

ALTER TABLE public.catalog_issue_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published issue layouts are public"
ON public.catalog_issue_blocks FOR SELECT TO anon, authenticated
USING (public.catalog_issue_is_published(issue_id));

CREATE POLICY "Editors manage issue layouts"
ON public.catalog_issue_blocks FOR ALL TO authenticated
USING (public.is_catalog_admin())
WITH CHECK (public.is_catalog_admin());

CREATE TRIGGER update_catalog_issue_blocks_updated_at
BEFORE UPDATE ON public.catalog_issue_blocks
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();