CREATE TABLE public.pen_threads (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'New conversation',
  book_id uuid REFERENCES public.books(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pen_threads TO authenticated;
GRANT ALL ON public.pen_threads TO service_role;
ALTER TABLE public.pen_threads ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors manage their own Pen threads" ON public.pen_threads
  FOR ALL TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE TRIGGER update_pen_threads_updated_at BEFORE UPDATE ON public.pen_threads
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.pen_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id uuid NOT NULL REFERENCES public.pen_threads(id) ON DELETE CASCADE,
  role text NOT NULL CHECK (role IN ('user','assistant')),
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.pen_messages TO authenticated;
GRANT ALL ON public.pen_messages TO service_role;
ALTER TABLE public.pen_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Authors manage messages in their own Pen threads" ON public.pen_messages
  FOR ALL TO authenticated
  USING (EXISTS (SELECT 1 FROM public.pen_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()))
  WITH CHECK (EXISTS (SELECT 1 FROM public.pen_threads t WHERE t.id = thread_id AND t.user_id = auth.uid()));
CREATE INDEX pen_messages_thread_created_idx ON public.pen_messages (thread_id, created_at);