
-- Create table for per-page SEO score tracking
CREATE TABLE public.page_seo_scores (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  page_path TEXT NOT NULL,
  page_title TEXT,
  overall_score INTEGER NOT NULL DEFAULT 0,
  has_meta_title BOOLEAN NOT NULL DEFAULT false,
  has_meta_description BOOLEAN NOT NULL DEFAULT false,
  has_canonical BOOLEAN NOT NULL DEFAULT false,
  has_og_tags BOOLEAN NOT NULL DEFAULT false,
  has_structured_data BOOLEAN NOT NULL DEFAULT false,
  has_h1 BOOLEAN NOT NULL DEFAULT false,
  has_alt_texts BOOLEAN NOT NULL DEFAULT false,
  missing_alt_count INTEGER NOT NULL DEFAULT 0,
  heading_hierarchy_valid BOOLEAN NOT NULL DEFAULT false,
  details JSONB DEFAULT '{}',
  scanned_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create unique index on page_path so we upsert per page
CREATE UNIQUE INDEX idx_page_seo_scores_path ON public.page_seo_scores (page_path);

-- Create index for sorting by score
CREATE INDEX idx_page_seo_scores_score ON public.page_seo_scores (overall_score);

-- Enable RLS
ALTER TABLE public.page_seo_scores ENABLE ROW LEVEL SECURITY;

-- Admin-only read policy
CREATE POLICY "Admins can view SEO scores"
  ON public.page_seo_scores
  FOR SELECT
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Admin-only manage policy
CREATE POLICY "Admins can manage SEO scores"
  ON public.page_seo_scores
  FOR ALL
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

-- Allow authenticated users to insert/update scores (from client-side scanning)
CREATE POLICY "Authenticated users can upsert SEO scores"
  ON public.page_seo_scores
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update SEO scores"
  ON public.page_seo_scores
  FOR UPDATE
  USING (auth.uid() IS NOT NULL);

-- Trigger for updated_at
CREATE TRIGGER update_page_seo_scores_updated_at
  BEFORE UPDATE ON public.page_seo_scores
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
