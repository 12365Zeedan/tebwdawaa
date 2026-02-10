
-- Fix record_blog_view: add post existence/published check and basic rate limiting
CREATE OR REPLACE FUNCTION public.record_blog_view(
  p_blog_post_id uuid,
  p_viewer_ip text DEFAULT NULL::text,
  p_user_agent text DEFAULT NULL::text,
  p_referrer text DEFAULT NULL::text,
  p_user_id uuid DEFAULT NULL::uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  post_exists boolean;
  duplicate_view boolean;
BEGIN
  -- Validate post exists and is published
  SELECT EXISTS(
    SELECT 1 FROM public.blog_posts
    WHERE id = p_blog_post_id
    AND is_published = true
  ) INTO post_exists;

  IF NOT post_exists THEN
    RAISE EXCEPTION 'Post not found or not published';
  END IF;

  -- Basic rate limiting: skip if same IP viewed same post within 1 hour
  IF p_viewer_ip IS NOT NULL THEN
    SELECT EXISTS(
      SELECT 1 FROM public.blog_post_views
      WHERE blog_post_id = p_blog_post_id
      AND viewer_ip = p_viewer_ip
      AND created_at > now() - interval '1 hour'
    ) INTO duplicate_view;

    IF duplicate_view THEN
      RETURN; -- Skip duplicate view
    END IF;
  END IF;

  -- Insert view record
  INSERT INTO public.blog_post_views (blog_post_id, viewer_ip, user_agent, referrer, user_id)
  VALUES (p_blog_post_id, p_viewer_ip, p_user_agent, p_referrer, p_user_id);

  -- Increment counter
  UPDATE public.blog_posts
  SET view_count = view_count + 1
  WHERE id = p_blog_post_id;
END;
$$;
