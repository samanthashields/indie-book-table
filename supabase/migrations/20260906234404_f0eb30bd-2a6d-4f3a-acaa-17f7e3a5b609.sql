CREATE TABLE public.pen_quick_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  section text NOT NULL,
  label text NOT NULL,
  prompt text NOT NULL,
  position integer NOT NULL DEFAULT 0,
  hidden boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.pen_quick_actions TO authenticated;
GRANT ALL ON public.pen_quick_actions TO service_role;

ALTER TABLE public.pen_quick_actions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors manage their own Pen buttons"
  ON public.pen_quick_actions FOR ALL TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE INDEX pen_quick_actions_user_section_idx ON public.pen_quick_actions (user_id, section, position);

CREATE TRIGGER update_pen_quick_actions_updated_at
  BEFORE UPDATE ON public.pen_quick_actions
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.milestone_checklist_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  milestone_id uuid NOT NULL REFERENCES public.milestones(id) ON DELETE CASCADE,
  book_id uuid NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  label text NOT NULL,
  done boolean NOT NULL DEFAULT false,
  position integer NOT NULL DEFAULT 0,
  ref_kind text,
  ref_book_id uuid,
  ref_milestone_id uuid,
  ref_slug text,
  ref_label text,
  created_by uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.milestone_checklist_items TO authenticated;
GRANT ALL ON public.milestone_checklist_items TO service_role;

ALTER TABLE public.milestone_checklist_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Book members manage checklist items"
  ON public.milestone_checklist_items FOR ALL TO authenticated
  USING (public.is_book_member(book_id))
  WITH CHECK (public.is_book_member(book_id));

CREATE INDEX milestone_checklist_items_milestone_idx ON public.milestone_checklist_items (milestone_id, position);

CREATE TRIGGER update_milestone_checklist_items_updated_at
  BEFORE UPDATE ON public.milestone_checklist_items
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();