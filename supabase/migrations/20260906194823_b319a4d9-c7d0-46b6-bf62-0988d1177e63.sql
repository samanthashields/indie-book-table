ALTER TABLE public.feature_requests
  ADD COLUMN IF NOT EXISTS priority text NOT NULL DEFAULT 'nice_to_have',
  ADD COLUMN IF NOT EXISTS links text[] NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS attachments jsonb NOT NULL DEFAULT '[]'::jsonb;

ALTER TABLE public.support_tickets
  ADD COLUMN IF NOT EXISTS feature_request_id uuid REFERENCES public.feature_requests(id) ON DELETE SET NULL;

CREATE TABLE public.feature_request_updates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  request_id uuid NOT NULL REFERENCES public.feature_requests(id) ON DELETE CASCADE,
  author_user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  status text NOT NULL,
  body text,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX feature_request_updates_request_idx ON public.feature_request_updates (request_id, created_at);

GRANT SELECT ON public.feature_request_updates TO authenticated;
GRANT ALL ON public.feature_request_updates TO service_role;

ALTER TABLE public.feature_request_updates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Readable when the idea is readable"
ON public.feature_request_updates
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.feature_requests r
    WHERE r.id = feature_request_updates.request_id
      AND (r.approved OR r.submitted_by = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  )
);

CREATE POLICY "Admins can post updates"
ON public.feature_request_updates
FOR INSERT
TO authenticated
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can edit updates"
ON public.feature_request_updates
FOR UPDATE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role))
WITH CHECK (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins can remove updates"
ON public.feature_request_updates
FOR DELETE
TO authenticated
USING (public.has_role(auth.uid(), 'admin'::public.app_role));

INSERT INTO public.feature_request_updates (request_id, author_user_id, status, body, created_at)
SELECT r.id, r.submitted_by, 'waiting', NULL, r.created_at FROM public.feature_requests r;

INSERT INTO public.feature_request_updates (request_id, author_user_id, status, body, created_at)
SELECT r.id, NULL, r.status, r.public_note, r.updated_at
FROM public.feature_requests r
WHERE r.public_note IS NOT NULL OR r.status <> 'waiting';