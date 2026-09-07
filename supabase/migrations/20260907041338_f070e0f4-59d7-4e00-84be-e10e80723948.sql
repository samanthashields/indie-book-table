CREATE TYPE public.challenge_metric AS ENUM ('cycles_completed', 'books_published', 'milestones_completed', 'books_featured');

CREATE TABLE public.challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  blurb text,
  challenge_month date NOT NULL,
  metric public.challenge_metric NOT NULL,
  target integer NOT NULL DEFAULT 1,
  decoration_key text NOT NULL,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.challenges TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.challenges TO authenticated;
GRANT ALL ON public.challenges TO service_role;

ALTER TABLE public.challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Signed-in authors read challenges"
  ON public.challenges FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins create challenges"
  ON public.challenges FOR INSERT TO authenticated WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins update challenges"
  ON public.challenges FOR UPDATE TO authenticated USING (public.is_catalog_admin()) WITH CHECK (public.is_catalog_admin());
CREATE POLICY "Admins delete challenges"
  ON public.challenges FOR DELETE TO authenticated USING (public.is_catalog_admin());

CREATE TRIGGER update_challenges_updated_at BEFORE UPDATE ON public.challenges
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.challenges(id) ON DELETE CASCADE,
  decoration_key text NOT NULL,
  completed_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, challenge_id)
);

GRANT SELECT ON public.challenge_completions TO authenticated;
GRANT ALL ON public.challenge_completions TO service_role;

ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors read their own completions"
  ON public.challenge_completions FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE TABLE public.table_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  slug text NOT NULL UNIQUE,
  image_path text NOT NULL,
  author_name text,
  book_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id)
);

GRANT SELECT ON public.table_shares TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.table_shares TO authenticated;
GRANT ALL ON public.table_shares TO service_role;

ALTER TABLE public.table_shares ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view a shared table"
  ON public.table_shares FOR SELECT USING (true);
CREATE POLICY "Authors create their own share"
  ON public.table_shares FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authors update their own share"
  ON public.table_shares FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());
CREATE POLICY "Authors delete their own share"
  ON public.table_shares FOR DELETE TO authenticated USING (user_id = auth.uid());

CREATE TRIGGER update_table_shares_updated_at BEFORE UPDATE ON public.table_shares
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();