-- The wishlist send log is written/read only by service-role code; RLS is already
-- enabled, so add an explicit deny-all policy to close the linter warning.
CREATE POLICY "No direct client access to wishlist send log"
ON public.catalog_wishlist_send_log
FOR ALL
TO anon, authenticated
USING (false)
WITH CHECK (false);