
DROP POLICY IF EXISTS "Authenticated users can upsert SEO scores" ON public.page_seo_scores;
DROP POLICY IF EXISTS "Authenticated users can update SEO scores" ON public.page_seo_scores;

CREATE POLICY "Admins can insert SEO scores"
  ON public.page_seo_scores
  FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update SEO scores"
  ON public.page_seo_scores
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'::app_role));
