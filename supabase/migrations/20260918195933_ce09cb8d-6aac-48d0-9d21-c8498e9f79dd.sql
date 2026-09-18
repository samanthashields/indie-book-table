DROP POLICY "Published help articles are readable by everyone" ON public.help_articles;
CREATE POLICY "Published help articles readable by anon" ON public.help_articles FOR SELECT TO anon USING (status = 'published'::post_status);
CREATE POLICY "Help articles readable by signed in" ON public.help_articles FOR SELECT TO authenticated USING (status = 'published'::post_status OR public.is_catalog_admin());

DROP POLICY "Published release notes are readable by everyone" ON public.release_notes;
CREATE POLICY "Published release notes readable by anon" ON public.release_notes FOR SELECT TO anon USING (status = 'published'::post_status);
CREATE POLICY "Release notes readable by signed in" ON public.release_notes FOR SELECT TO authenticated USING (status = 'published'::post_status OR public.is_catalog_admin());