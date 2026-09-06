CREATE TABLE public.feature_requests (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  submitted_by uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  area text,
  status text NOT NULL DEFAULT 'waiting',
  public_note text,
  approved boolean NOT NULL DEFAULT false,
  vote_count integer NOT NULL DEFAULT 0,
  merged_into uuid REFERENCES public.feature_requests(id) ON DELETE SET NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.feature_request_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE (request_id, user_id)
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.feature_requests TO authenticated;
GRANT ALL ON public.feature_requests TO service_role;
GRANT SELECT, INSERT, DELETE ON public.feature_request_votes TO authenticated;
GRANT ALL ON public.feature_request_votes TO service_role;

ALTER TABLE public.feature_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feature_request_votes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Authors read approved requests and their own"
  ON public.feature_requests FOR SELECT TO authenticated
  USING (approved OR submitted_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authors submit their own requests"
  ON public.feature_requests FOR INSERT TO authenticated
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Authors edit their own pending requests"
  ON public.feature_requests FOR UPDATE TO authenticated
  USING (submitted_by = auth.uid() AND status = 'waiting' AND NOT approved)
  WITH CHECK (submitted_by = auth.uid());

CREATE POLICY "Admins change any request"
  ON public.feature_requests FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Authors withdraw their own pending requests"
  ON public.feature_requests FOR DELETE TO authenticated
  USING ((submitted_by = auth.uid() AND status = 'waiting' AND NOT approved) OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Votes are visible with their request"
  ON public.feature_request_votes FOR SELECT TO authenticated
  USING (EXISTS (SELECT 1 FROM public.feature_requests r WHERE r.id = request_id AND (r.approved OR r.submitted_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))));

CREATE POLICY "Authors add their own vote"
  ON public.feature_request_votes FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid() AND EXISTS (SELECT 1 FROM public.feature_requests r WHERE r.id = request_id AND r.approved));

CREATE POLICY "Authors remove their own vote"
  ON public.feature_request_votes FOR DELETE TO authenticated
  USING (user_id = auth.uid());

CREATE TRIGGER update_feature_requests_updated_at
  BEFORE UPDATE ON public.feature_requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE OR REPLACE FUNCTION public.sync_feature_request_votes()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.feature_requests SET vote_count = vote_count + 1 WHERE id = NEW.request_id;
    RETURN NEW;
  ELSE
    UPDATE public.feature_requests SET vote_count = GREATEST(vote_count - 1, 0) WHERE id = OLD.request_id;
    RETURN OLD;
  END IF;
END;
$$;

CREATE TRIGGER feature_request_votes_sync
  AFTER INSERT OR DELETE ON public.feature_request_votes
  FOR EACH ROW EXECUTE FUNCTION public.sync_feature_request_votes();

CREATE INDEX feature_requests_status_idx ON public.feature_requests (status);
CREATE INDEX feature_requests_approved_idx ON public.feature_requests (approved, created_at DESC);

ALTER TABLE public.profiles ADD COLUMN feature_email_opt_out boolean NOT NULL DEFAULT false;