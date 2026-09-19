-- One global grid/list default per author, applied on every collection page
-- (My Books, Templates, Collaborations, My Cycles, My Submissions).
-- Null means "not chosen yet": each page falls back to its own default.
ALTER TABLE public.profiles
  ADD COLUMN view_preference text
  CHECK (view_preference IN ('list', 'grid'));
