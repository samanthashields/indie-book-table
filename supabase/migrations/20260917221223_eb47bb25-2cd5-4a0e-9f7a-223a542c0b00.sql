CREATE TABLE public.workshop_onboarding (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  enabled boolean NOT NULL DEFAULT true,
  heading text NOT NULL DEFAULT 'Welcome to the Author''s Workshop',
  body text NOT NULL DEFAULT 'This is your space to plan, shape, and publish your books. Take a quick look around, or continue when you are ready.',
  primary_label text NOT NULL DEFAULT 'Start walkthrough',
  secondary_label text NOT NULL DEFAULT 'Continue to workshop',
  media_kind text NOT NULL DEFAULT 'none' CHECK (media_kind IN ('none', 'image', 'video')),
  media_value text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT workshop_onboarding_singleton CHECK (id = '00000000-0000-0000-0000-000000000001'::uuid)
);
GRANT SELECT ON public.workshop_onboarding TO authenticated;
GRANT ALL ON public.workshop_onboarding TO service_role;
ALTER TABLE public.workshop_onboarding ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in users can view Workshop onboarding"
ON public.workshop_onboarding FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can create Workshop onboarding"
ON public.workshop_onboarding FOR INSERT TO authenticated WITH CHECK (private.is_catalog_admin());
CREATE POLICY "Admins can update Workshop onboarding"
ON public.workshop_onboarding FOR UPDATE TO authenticated USING (private.is_catalog_admin()) WITH CHECK (private.is_catalog_admin());
CREATE POLICY "Admins can remove Workshop onboarding"
ON public.workshop_onboarding FOR DELETE TO authenticated USING (private.is_catalog_admin());

CREATE TABLE public.workshop_tour_steps (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  media_kind text NOT NULL DEFAULT 'none' CHECK (media_kind IN ('none', 'image', 'video')),
  media_value text NOT NULL DEFAULT '',
  destination_label text NOT NULL DEFAULT '',
  destination_path text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  published boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.workshop_tour_steps TO authenticated;
GRANT ALL ON public.workshop_tour_steps TO service_role;
ALTER TABLE public.workshop_tour_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in users can view published Workshop tour steps"
ON public.workshop_tour_steps FOR SELECT TO authenticated USING (published OR private.is_catalog_admin());
CREATE POLICY "Admins can create Workshop tour steps"
ON public.workshop_tour_steps FOR INSERT TO authenticated WITH CHECK (private.is_catalog_admin());
CREATE POLICY "Admins can update Workshop tour steps"
ON public.workshop_tour_steps FOR UPDATE TO authenticated USING (private.is_catalog_admin()) WITH CHECK (private.is_catalog_admin());
CREATE POLICY "Admins can remove Workshop tour steps"
ON public.workshop_tour_steps FOR DELETE TO authenticated USING (private.is_catalog_admin());

CREATE TABLE public.workshop_onboarding_state (
  user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  dismissed boolean NOT NULL DEFAULT false,
  completed boolean NOT NULL DEFAULT false,
  current_step integer NOT NULL DEFAULT 0 CHECK (current_step >= 0),
  last_seen_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.workshop_onboarding_state TO authenticated;
GRANT ALL ON public.workshop_onboarding_state TO service_role;
ALTER TABLE public.workshop_onboarding_state ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors can view their own Workshop onboarding state"
ON public.workshop_onboarding_state FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Authors can create their own Workshop onboarding state"
ON public.workshop_onboarding_state FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can update their own Workshop onboarding state"
ON public.workshop_onboarding_state FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Authors can remove their own Workshop onboarding state"
ON public.workshop_onboarding_state FOR DELETE TO authenticated USING (auth.uid() = user_id);

INSERT INTO public.workshop_onboarding (id)
VALUES ('00000000-0000-0000-0000-000000000001');

INSERT INTO public.workshop_tour_steps (title, body, destination_label, destination_path, position, published) VALUES
('Keep every book together', 'My Books is the starting point for your projects, details, files, and book listing profiles.', 'Open My Books', '/', 0, true),
('Build with a clear path', 'Book Cycles break the work into phases and milestones without flattening the publishing process into one long task list.', 'View My Cycles', '/cycles', 1, true),
('Start from a proven structure', 'Templates give you a thoughtful starting point. You can preview one before using it for a new Book Cycle.', 'Browse templates', '/templates', 2, true),
('Work with your people', 'Collaborations keeps shared books and the next work each person owns visible in one place.', 'View collaborations', '/collaborations', 3, true),
('Bring your book to The Table', 'My Submissions follows a book listing profile from preparation through editorial review and publication.', 'View submissions', '/submissions', 4, true),
('Ask Pen for a next step', 'Pen is your AI book coach for practical guidance. Pen recommends and explains, while you stay in control of every decision.', 'Meet Pen', '/pen', 5, true);

CREATE OR REPLACE FUNCTION public.set_workshop_onboarding_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;
REVOKE ALL ON FUNCTION public.set_workshop_onboarding_updated_at() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.set_workshop_onboarding_updated_at() TO service_role;
CREATE TRIGGER workshop_onboarding_updated_at BEFORE UPDATE ON public.workshop_onboarding
FOR EACH ROW EXECUTE FUNCTION public.set_workshop_onboarding_updated_at();
CREATE TRIGGER workshop_tour_steps_updated_at BEFORE UPDATE ON public.workshop_tour_steps
FOR EACH ROW EXECUTE FUNCTION public.set_workshop_onboarding_updated_at();
CREATE TRIGGER workshop_onboarding_state_updated_at BEFORE UPDATE ON public.workshop_onboarding_state
FOR EACH ROW EXECUTE FUNCTION public.set_workshop_onboarding_updated_at();

CREATE POLICY "Signed in users can read onboarding media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'onboarding-media');
CREATE POLICY "Admins can upload onboarding media"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'onboarding-media' AND private.is_catalog_admin());
CREATE POLICY "Admins can update onboarding media"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'onboarding-media' AND private.is_catalog_admin())
WITH CHECK (bucket_id = 'onboarding-media' AND private.is_catalog_admin());
CREATE POLICY "Admins can remove onboarding media"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'onboarding-media' AND private.is_catalog_admin());