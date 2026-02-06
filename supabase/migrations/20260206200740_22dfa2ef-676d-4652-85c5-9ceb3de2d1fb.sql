
-- Fix blog_categories: replace FOR ALL with explicit per-operation policies
DROP POLICY "Admins can manage blog categories" ON public.blog_categories;

CREATE POLICY "Admins can insert blog categories"
  ON public.blog_categories FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog categories"
  ON public.blog_categories FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog categories"
  ON public.blog_categories FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));

-- Fix blog_pages: replace FOR ALL with explicit per-operation policies
DROP POLICY "Admins can manage blog pages" ON public.blog_pages;

-- Admins can also SELECT unpublished pages
CREATE POLICY "Admins can view all pages"
  ON public.blog_pages FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can insert blog pages"
  ON public.blog_pages FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update blog pages"
  ON public.blog_pages FOR UPDATE
  USING (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete blog pages"
  ON public.blog_pages FOR DELETE
  USING (public.has_role(auth.uid(), 'admin'));
