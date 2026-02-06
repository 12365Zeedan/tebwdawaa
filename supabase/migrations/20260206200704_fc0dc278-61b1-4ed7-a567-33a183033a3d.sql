
-- Create blog_categories table for structured blog category management
CREATE TABLE public.blog_categories (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  description_ar TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_categories ENABLE ROW LEVEL SECURITY;

-- Public read access for blog categories
CREATE POLICY "Blog categories are viewable by everyone"
  ON public.blog_categories FOR SELECT
  USING (true);

-- Admin-only write access
CREATE POLICY "Admins can manage blog categories"
  ON public.blog_categories FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Create blog_pages table for static content pages
CREATE TABLE public.blog_pages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  title_ar TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  content TEXT,
  content_ar TEXT,
  is_published BOOLEAN NOT NULL DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  meta_title TEXT,
  meta_title_ar TEXT,
  meta_description TEXT,
  meta_description_ar TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.blog_pages ENABLE ROW LEVEL SECURITY;

-- Public can read published pages
CREATE POLICY "Published pages are viewable by everyone"
  ON public.blog_pages FOR SELECT
  USING (is_published = true);

-- Admin full access
CREATE POLICY "Admins can manage blog pages"
  ON public.blog_pages FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- Add updated_at triggers
CREATE TRIGGER update_blog_categories_updated_at
  BEFORE UPDATE ON public.blog_categories
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_blog_pages_updated_at
  BEFORE UPDATE ON public.blog_pages
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();
