-- 1. Phase key rename (data + constraint)
UPDATE phases SET key = CASE key
  WHEN 'writing' THEN 'writing_development'
  WHEN 'prelaunch' THEN 'pre_launch'
  WHEN 'growth' THEN 'post_launch_growth'
  ELSE key END;
ALTER TABLE phases ADD CONSTRAINT phases_key_check CHECK (key IN
  ('writing_development','editing','production','pre_launch','launch','post_launch_growth'));

-- 2. Requirement type re-encoding (data + constraint)
UPDATE milestones SET requirement_type = CASE requirement_type
  WHEN 'Request a Service' THEN 'request_a_service'
  WHEN 'Attach a File' THEN 'attach_a_file'
  WHEN 'Complete an Activity Outside the Platform' THEN 'complete_activity_outside'
  WHEN 'Approve a Deliverable' THEN 'approve_a_deliverable'
  ELSE requirement_type END;
ALTER TABLE milestones ADD CONSTRAINT milestones_requirement_type_check CHECK (requirement_type IN
  ('request_a_service','attach_a_file','complete_activity_outside','approve_a_deliverable'));

-- 3. Milestone structural fields
ALTER TABLE milestones ADD COLUMN track text NULL;
ALTER TABLE milestones ADD COLUMN provision text NULL CHECK (provision IN ('diy','hire','n/a'));
ALTER TABLE milestones ADD COLUMN depends_on jsonb NOT NULL DEFAULT '[]';

-- 4. Owner restructure (keep existing `owner` text column as legacy display fallback, don't drop)
ALTER TABLE milestones ADD COLUMN owner_kind text NOT NULL DEFAULT 'author'
  CHECK (owner_kind IN ('author','collaborator','unassigned'));
ALTER TABLE milestones ADD COLUMN owner_collaborator_id uuid NULL REFERENCES collaborators(id) ON DELETE SET NULL;

-- 5. Approved Plan Schema field
ALTER TABLE books ADD COLUMN target_launch_date_confirmed boolean NOT NULL DEFAULT false;

-- 6. Group 2 bug fix: formats has no column today
ALTER TABLE books ADD COLUMN formats text[] NOT NULL DEFAULT '{}'
  CHECK (formats <@ ARRAY['ebook','paperback','hardcover','audiobook']::text[]);

-- 7. starts_here + parallel tracks
ALTER TABLE phases ADD COLUMN starts_here boolean NOT NULL DEFAULT false;
ALTER TABLE phases ADD COLUMN tracks jsonb NULL;

-- 8. Group 3: phase hide/show (display-layer only)
ALTER TABLE phases ADD COLUMN hidden boolean NOT NULL DEFAULT false;

-- 9. Setup Tasks
CREATE TABLE public.book_setup_tasks (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  key text NOT NULL,
  label text NOT NULL,
  description text NULL,
  status text NOT NULL DEFAULT 'pending',
  position int NOT NULL DEFAULT 0,
  completed_at timestamptz NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.book_setup_tasks TO authenticated;
GRANT ALL ON public.book_setup_tasks TO service_role;
ALTER TABLE public.book_setup_tasks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors manage their setup tasks" ON public.book_setup_tasks
  FOR ALL TO authenticated
  USING (is_book_author(book_id) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (is_book_author(book_id) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Book members can view setup tasks" ON public.book_setup_tasks
  FOR SELECT TO authenticated
  USING (is_book_member(book_id));

-- 10. Resources
CREATE TABLE public.resources (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id uuid NOT NULL REFERENCES books(id) ON DELETE CASCADE,
  milestone_id uuid NULL REFERENCES milestones(id) ON DELETE CASCADE,
  kind text NOT NULL CHECK (kind IN ('file','link','manuscript_link')),
  label text NOT NULL,
  url text NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.resources TO authenticated;
GRANT ALL ON public.resources TO service_role;
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors manage their resources" ON public.resources
  FOR ALL TO authenticated
  USING (is_book_author(book_id) OR has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (is_book_author(book_id) OR has_role(auth.uid(), 'admin'::app_role));
CREATE POLICY "Book members can view resources" ON public.resources
  FOR SELECT TO authenticated
  USING (is_book_member(book_id));