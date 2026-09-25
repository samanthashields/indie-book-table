-- Editable copy for the first-visit Book Cycle tour. The steps and the parts of the page they point at
-- are fixed in code (keyed by `key`); admins only edit the words and can switch a step off.
CREATE TABLE public.cycle_tour_steps (
  key text PRIMARY KEY,
  title text NOT NULL,
  body text NOT NULL DEFAULT '',
  position integer NOT NULL DEFAULT 0,
  enabled boolean NOT NULL DEFAULT true,
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.cycle_tour_steps TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.cycle_tour_steps TO authenticated;
GRANT ALL ON public.cycle_tour_steps TO service_role;
ALTER TABLE public.cycle_tour_steps ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Signed in users can view Book Cycle tour steps"
ON public.cycle_tour_steps FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can create Book Cycle tour steps"
ON public.cycle_tour_steps FOR INSERT TO authenticated WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins can update Book Cycle tour steps"
ON public.cycle_tour_steps FOR UPDATE TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins can remove Book Cycle tour steps"
ON public.cycle_tour_steps FOR DELETE TO authenticated USING (public.is_catalog_admin());

CREATE TRIGGER cycle_tour_steps_updated_at BEFORE UPDATE ON public.cycle_tour_steps
FOR EACH ROW EXECUTE FUNCTION public.set_workshop_onboarding_updated_at();

INSERT INTO public.cycle_tour_steps (key, title, body, position) VALUES
('welcome', 'Welcome to your Book Cycle', 'This is your plan for taking a book from idea to published, one phase and milestone at a time. Pen will show you around.', 0),
('header', 'Your book’s toolbox', 'Book details, collaborators, and resources live up here, along with your recommended tasks and the option to end your cycle when you’re done.', 1),
('progress', 'Progress at a glance', 'See how far along you are, your target publication date, and the next thing to work on.', 2),
('setup_tasks', 'Set up recommended tasks', 'Optional decisions and habits worth settling early, like your budget and publishing path. Nothing here blocks your cycle.', 3),
('phases', 'Your publishing path', 'Six phases take you from private manuscript to published book. Open a phase to see its milestones, then click a milestone to add notes, files, and steps.', 4),
('post_launch', 'After launch', 'An optional checklist for keeping your book growing once it’s out in the world. Check items off in any order.', 5);
