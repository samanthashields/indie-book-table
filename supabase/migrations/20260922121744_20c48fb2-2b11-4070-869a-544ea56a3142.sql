
-- help_categories: public reads limited to categories that actually have a published article
DROP POLICY IF EXISTS "Help categories are readable by everyone" ON public.help_categories;
CREATE POLICY "Published help categories are readable"
ON public.help_categories FOR SELECT TO anon, authenticated
USING (
  EXISTS (
    SELECT 1 FROM public.help_articles a
    WHERE a.category_id = help_categories.id AND a.status = 'published'
  )
  OR private.is_catalog_admin()
);

-- challenges: signed-in authors only see active challenges; admins see all
DROP POLICY IF EXISTS "Signed-in authors read challenges" ON public.challenges;
CREATE POLICY "Signed-in authors read active challenges"
ON public.challenges FOR SELECT TO authenticated
USING (active = true OR private.is_catalog_admin());

-- workshop_onboarding: signed-in users only see the welcome when it is switched on
DROP POLICY IF EXISTS "Signed in users can view Workshop onboarding" ON public.workshop_onboarding;
CREATE POLICY "Signed in users view enabled Workshop onboarding"
ON public.workshop_onboarding FOR SELECT TO authenticated
USING (enabled = true OR private.is_catalog_admin());

-- table_shares: only the owner (or an admin) reads rows directly; public pages go through the server
DROP POLICY IF EXISTS "Anyone can view a shared table" ON public.table_shares;
CREATE POLICY "Authors read their own share"
ON public.table_shares FOR SELECT TO authenticated
USING (user_id = auth.uid() OR private.is_catalog_admin());
REVOKE SELECT ON public.table_shares FROM anon;

-- catalog covers: owner or admin only; public catalog pages get links signed server-side
DROP POLICY IF EXISTS "Catalog covers are readable" ON storage.objects;
CREATE POLICY "Authors read their own catalog covers"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'catalog-covers'
  AND ((storage.foldername(name))[1] = (auth.uid())::text OR private.is_catalog_admin())
);

-- onboarding media: admins only; authors get links signed server-side
DROP POLICY IF EXISTS "Signed in users can read onboarding media" ON storage.objects;
CREATE POLICY "Admins can read onboarding media"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'onboarding-media' AND private.is_catalog_admin());
