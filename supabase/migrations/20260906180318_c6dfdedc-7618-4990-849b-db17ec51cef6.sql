CREATE TABLE public.help_categories (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  position integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.help_categories TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.help_categories TO authenticated;
GRANT ALL ON public.help_categories TO service_role;
ALTER TABLE public.help_categories ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Help categories are readable by everyone" ON public.help_categories FOR SELECT USING (true);
CREATE POLICY "Admins manage help categories" ON public.help_categories FOR ALL TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());
CREATE TRIGGER update_help_categories_updated_at BEFORE UPDATE ON public.help_categories FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.help_articles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  summary text,
  category_id uuid REFERENCES public.help_categories(id) ON DELETE SET NULL,
  body text NOT NULL DEFAULT '',
  cover_image_url text,
  status public.post_status NOT NULL DEFAULT 'draft',
  related_ids uuid[] NOT NULL DEFAULT '{}',
  position integer NOT NULL DEFAULT 0,
  published_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.help_articles TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.help_articles TO authenticated;
GRANT ALL ON public.help_articles TO service_role;
ALTER TABLE public.help_articles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published help articles are readable by everyone" ON public.help_articles FOR SELECT USING (status = 'published' OR public.is_catalog_admin());
CREATE POLICY "Admins manage help articles" ON public.help_articles FOR ALL TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());
CREATE TRIGGER update_help_articles_updated_at BEFORE UPDATE ON public.help_articles FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.release_notes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  label text,
  body text NOT NULL DEFAULT '',
  highlight boolean NOT NULL DEFAULT false,
  status public.post_status NOT NULL DEFAULT 'draft',
  released_on date NOT NULL DEFAULT current_date,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.release_notes TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.release_notes TO authenticated;
GRANT ALL ON public.release_notes TO service_role;
ALTER TABLE public.release_notes ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Published release notes are readable by everyone" ON public.release_notes FOR SELECT USING (status = 'published' OR public.is_catalog_admin());
CREATE POLICY "Admins manage release notes" ON public.release_notes FOR ALL TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());
CREATE TRIGGER update_release_notes_updated_at BEFORE UPDATE ON public.release_notes FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.support_tickets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject text NOT NULL,
  status text NOT NULL DEFAULT 'new',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT support_tickets_status_check CHECK (status IN ('new','open','waiting','resolved'))
);
GRANT SELECT, INSERT, UPDATE ON public.support_tickets TO authenticated;
GRANT ALL ON public.support_tickets TO service_role;
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors read their own tickets" ON public.support_tickets FOR SELECT TO authenticated USING (user_id = auth.uid() OR public.is_catalog_admin());
CREATE POLICY "Authors open tickets" ON public.support_tickets FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authors and admins update tickets" ON public.support_tickets FOR UPDATE TO authenticated USING (user_id = auth.uid() OR public.is_catalog_admin()) WITH CHECK (user_id = auth.uid() OR public.is_catalog_admin());
CREATE TRIGGER update_support_tickets_updated_at BEFORE UPDATE ON public.support_tickets FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.support_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ticket_id uuid NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_admin boolean NOT NULL DEFAULT false,
  body text NOT NULL,
  attachment_path text,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT ON public.support_messages TO authenticated;
GRANT ALL ON public.support_messages TO service_role;
ALTER TABLE public.support_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Ticket participants read messages" ON public.support_messages FOR SELECT TO authenticated USING (
  public.is_catalog_admin() OR EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
);
CREATE POLICY "Ticket participants write messages" ON public.support_messages FOR INSERT TO authenticated WITH CHECK (
  sender_user_id = auth.uid() AND (
    public.is_catalog_admin() OR EXISTS (SELECT 1 FROM public.support_tickets t WHERE t.id = ticket_id AND t.user_id = auth.uid())
  )
);

INSERT INTO public.help_categories (slug, name, description, position) VALUES
  ('getting-started', 'Getting started', 'Set up your shelf, your first book, and your first cycle.', 1),
  ('book-cycles', 'Book cycles', 'Phases, milestones, timelines and collaborators.', 2),
  ('the-table', 'The Indie Author Table', 'Submitting books, issues, and being featured.', 3),
  ('account-billing', 'Account and plans', 'Your account, plan, and collaborators.', 4);

INSERT INTO public.help_articles (slug, title, summary, category_id, body, status, published_at)
SELECT 'welcome-to-the-workshop', 'Welcome to the Author''s Workshop',
  'A quick tour of My Books, cycles, templates and The Table.',
  c.id,
  E'## Start with a book\n\nEvery book begins on the **My Books** shelf. Add a title with a few details, and come back to it whenever you like.\n\n## Start a cycle when you are ready\n\nOpen the menu on any book and choose **Create book cycle**. Pick a template or build from scratch, and the workshop lays out phases, milestones and suggested dates.\n\n## Bring a book to The Table\n\nWhen a book is published, send it to The Indie Author Table and track it on **My Submissions**.',
  'published', now()
FROM public.help_categories c WHERE c.slug = 'getting-started';

INSERT INTO public.release_notes (title, label, body, highlight, status, released_on) VALUES
  ('Help Center, My Cycles and end-of-cycle wrap-ups', 'New',
   E'- A **Help Center** with articles, release notes and a way to message support.\n- **My Cycles** groups every cycle by Not started, In progress and Complete.\n- **End book cycle** asks a few wrap-up questions and saves them to your Reflection.\n- Book details now has a cycle start date.',
   true, 'published', current_date);