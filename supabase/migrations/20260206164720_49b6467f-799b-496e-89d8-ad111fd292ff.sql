
-- Add view_count column to blog_posts
ALTER TABLE public.blog_posts ADD COLUMN IF NOT EXISTS view_count integer NOT NULL DEFAULT 0;

-- Create detailed view tracking table
CREATE TABLE public.blog_post_views (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  blog_post_id uuid NOT NULL REFERENCES public.blog_posts(id) ON DELETE CASCADE,
  viewer_ip text,
  user_agent text,
  referrer text,
  user_id uuid,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Index for fast lookups
CREATE INDEX idx_blog_post_views_post_id ON public.blog_post_views(blog_post_id);
CREATE INDEX idx_blog_post_views_created_at ON public.blog_post_views(created_at);

-- Enable RLS
ALTER TABLE public.blog_post_views ENABLE ROW LEVEL SECURITY;

-- Anyone can insert a view (anonymous tracking)
CREATE POLICY "Anyone can record a view"
ON public.blog_post_views
FOR INSERT
WITH CHECK (true);

-- Only admins can read view analytics
CREATE POLICY "Admins can read view analytics"
ON public.blog_post_views
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

-- Only admins can delete view records
CREATE POLICY "Admins can delete view records"
ON public.blog_post_views
FOR DELETE
USING (has_role(auth.uid(), 'admin'::app_role));

-- Function to increment view count and record the view
CREATE OR REPLACE FUNCTION public.record_blog_view(
  p_blog_post_id uuid,
  p_viewer_ip text DEFAULT NULL,
  p_user_agent text DEFAULT NULL,
  p_referrer text DEFAULT NULL,
  p_user_id uuid DEFAULT NULL
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  -- Insert the view record
  INSERT INTO public.blog_post_views (blog_post_id, viewer_ip, user_agent, referrer, user_id)
  VALUES (p_blog_post_id, p_viewer_ip, p_user_agent, p_referrer, p_user_id);

  -- Increment the counter
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = p_blog_post_id;
END;
$$;
